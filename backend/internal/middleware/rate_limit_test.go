package middleware

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"golang.org/x/time/rate"
)

func TestRateLimit(t *testing.T) {
	// 10 requests per second, burst of 2
	limiter := NewLimiter(rate.Limit(10), 2)
	middleware := RateLimit(limiter)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("GET", "http://example.com", nil)
	req.RemoteAddr = "1.2.3.4"

	// First request - should be OK
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req)
	if rr1.Code != http.StatusOK {
		t.Errorf("expected status OK, got %v", rr1.Code)
	}

	// Second request - should be OK (burst is 2)
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req)
	if rr2.Code != http.StatusOK {
		t.Errorf("expected status OK, got %v", rr2.Code)
	}

	// Third request - should be Limited
	rr3 := httptest.NewRecorder()
	handler.ServeHTTP(rr3, req)
	if rr3.Code != http.StatusTooManyRequests {
		t.Errorf("expected status TooManyRequests, got %v", rr3.Code)
	}

	// Wait for a bit to allow one more request
	time.Sleep(200 * time.Millisecond)

	// Fourth request - should be OK again
	rr4 := httptest.NewRecorder()
	handler.ServeHTTP(rr4, req)
	if rr4.Code != http.StatusOK {
		t.Errorf("expected status OK after wait, got %v", rr4.Code)
	}
}

func TestRateLimit_DifferentIPs(t *testing.T) {
	limiter := NewLimiter(rate.Limit(1), 1)
	middleware := RateLimit(limiter)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// IP 1
	req1 := httptest.NewRequest("GET", "http://example.com", nil)
	req1.RemoteAddr = "1.1.1.1"
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusOK {
		t.Errorf("expected status OK for IP 1, got %v", rr1.Code)
	}

	// IP 1 again - should be Limited
	rr1b := httptest.NewRecorder()
	handler.ServeHTTP(rr1b, req1)
	if rr1b.Code != http.StatusTooManyRequests {
		t.Errorf("expected status TooManyRequests for IP 1, got %v", rr1b.Code)
	}

	// IP 2 - should be OK
	req2 := httptest.NewRequest("GET", "http://example.com", nil)
	req2.RemoteAddr = "2.2.2.2"
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req2)
	if rr2.Code != http.StatusOK {
		t.Errorf("expected status OK for IP 2, got %v", rr2.Code)
	}
}

func TestRateLimit_RemainingHeaderReflectsConsumedToken(t *testing.T) {
	limiter := NewLimiter(rate.Limit(1), 2)
	middleware := RateLimit(limiter)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("GET", "http://example.com", nil)
	req.RemoteAddr = "1.2.3.4"

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status OK, got %v", rr.Code)
	}
	if got := rr.Header().Get("X-RateLimit-Remaining"); got != "1" {
		t.Fatalf("X-RateLimit-Remaining = %q, want 1", got)
	}
}

func TestRateLimit_DoesNotTrustForwardedForFromUntrustedRemote(t *testing.T) {
	limiter := NewLimiter(rate.Limit(1), 1)
	middleware := RateLimit(limiter)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	for i := 0; i < 2; i++ {
		req := httptest.NewRequest("GET", "http://example.com", nil)
		req.RemoteAddr = "1.2.3.4:12345"
		req.Header.Set("X-Forwarded-For", fmt.Sprintf("203.0.113.%d", i+1))

		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if i == 0 && rr.Code != http.StatusOK {
			t.Fatalf("expected first request OK, got %v", rr.Code)
		}
		if i == 1 && rr.Code != http.StatusTooManyRequests {
			t.Fatalf("expected second spoofed request to be limited, got %v", rr.Code)
		}
	}
}

func TestRateLimit_TrustsForwardedForFromConfiguredProxy(t *testing.T) {
	limiter := NewLimiter(rate.Limit(1), 1)
	if err := limiter.SetTrustedProxies([]string{"10.0.0.0/8"}); err != nil {
		t.Fatalf("SetTrustedProxies returned error: %v", err)
	}
	middleware := RateLimit(limiter)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	for i := 0; i < 2; i++ {
		req := httptest.NewRequest("GET", "http://example.com", nil)
		req.RemoteAddr = "10.0.0.10:12345"
		req.Header.Set("X-Forwarded-For", fmt.Sprintf("203.0.113.%d", i+1))

		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Fatalf("expected trusted forwarded request %d to be OK, got %v", i+1, rr.Code)
		}
	}
}

func TestRateLimitFailures_DoesNotConsumeSuccessfulRequests(t *testing.T) {
	limiter := NewLimiter(rate.Limit(1), 1)
	middleware := RateLimitFailures(limiter, http.StatusUnauthorized)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("POST", "http://example.com/auth/login", nil)
	req.RemoteAddr = "1.2.3.4"

	for i := 0; i < 3; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Fatalf("expected successful request %d to stay allowed, got %v", i+1, rr.Code)
		}
	}
}

func TestRateLimitFailures_ConsumesOnlyConfiguredFailureStatus(t *testing.T) {
	limiter := NewLimiter(rate.Limit(1), 1)
	middleware := RateLimitFailures(limiter, http.StatusUnauthorized)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	}))

	req := httptest.NewRequest("POST", "http://example.com/auth/login", nil)
	req.RemoteAddr = "1.2.3.4"

	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req)
	if rr1.Code != http.StatusUnauthorized {
		t.Fatalf("expected first failed login to reach handler, got %v", rr1.Code)
	}

	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req)
	if rr2.Code != http.StatusTooManyRequests {
		t.Fatalf("expected exhausted failure limiter to block, got %v", rr2.Code)
	}
}
