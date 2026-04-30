package middleware

import (
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
