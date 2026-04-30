package middleware

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"

	"golang.org/x/time/rate"
	"goevoli/internal/response"
)

type Limiter struct {
	ips map[string]*rate.Limiter
	mu  sync.Mutex
	r   rate.Limit
	b   int
}

func NewLimiter(r rate.Limit, b int) *Limiter {
	return &Limiter{
		ips: make(map[string]*rate.Limiter),
		r:   r,
		b:   b,
	}
}

func (l *Limiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()

	lim, ok := l.ips[ip]
	if !ok {
		lim = rate.NewLimiter(l.r, l.b)
		l.ips[ip] = lim
	}
	return lim
}

func RateLimit(l *Limiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip, _, err := net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				ip = r.RemoteAddr
			}

			if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
				ip = strings.TrimSpace(strings.Split(xff, ",")[0])
			}

			lim := l.get(ip)
			
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", l.b))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", int(lim.Tokens())))

			if !lim.Allow() {
				w.Header().Set("X-RateLimit-Remaining", "0")
				response.Error(w, http.StatusTooManyRequests, "Account gesperrt. Zu viele Fehlversuche.")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
