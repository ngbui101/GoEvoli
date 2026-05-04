package middleware

import (
	"fmt"
	"net"
	"net/http"
	"net/netip"
	"strings"
	"sync"

	"goevoli/internal/response"
	"golang.org/x/time/rate"
)

type Limiter struct {
	ips            map[string]*rate.Limiter
	mu             sync.Mutex
	r              rate.Limit
	b              int
	trustedProxies []netip.Prefix
}

func NewLimiter(r rate.Limit, b int) *Limiter {
	return &Limiter{
		ips: make(map[string]*rate.Limiter),
		r:   r,
		b:   b,
	}
}

func (l *Limiter) SetTrustedProxies(proxies []string) error {
	trustedProxies := make([]netip.Prefix, 0, len(proxies))
	for _, proxy := range proxies {
		proxy = strings.TrimSpace(proxy)
		if proxy == "" {
			continue
		}

		if prefix, err := netip.ParsePrefix(proxy); err == nil {
			trustedProxies = append(trustedProxies, prefix)
			continue
		}

		ip, err := netip.ParseAddr(proxy)
		if err != nil {
			return fmt.Errorf("invalid trusted proxy %q: %w", proxy, err)
		}
		trustedProxies = append(trustedProxies, netip.PrefixFrom(ip, ip.BitLen()))
	}

	l.trustedProxies = trustedProxies
	return nil
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

func (l *Limiter) clientIP(r *http.Request) string {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		ip = r.RemoteAddr
	}

	remoteIP, err := netip.ParseAddr(ip)
	if err != nil || !l.isTrustedProxy(remoteIP) {
		return ip
	}

	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		forwardedIP := strings.TrimSpace(strings.Split(xff, ",")[0])
		if parsedIP, err := netip.ParseAddr(forwardedIP); err == nil {
			return parsedIP.String()
		}
	}

	return ip
}

func (l *Limiter) isTrustedProxy(ip netip.Addr) bool {
	ip = ip.Unmap()
	for _, proxy := range l.trustedProxies {
		if proxy.Contains(ip) {
			return true
		}
	}
	return false
}

func RateLimit(l *Limiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := l.clientIP(r)

			lim := l.get(ip)

			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", l.b))

			if !lim.Allow() {
				w.Header().Set("X-RateLimit-Remaining", "0")
				response.Error(w, http.StatusTooManyRequests, "Account gesperrt. Zu viele Fehlversuche.")
				return
			}

			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", int(lim.Tokens())))
			next.ServeHTTP(w, r)
		})
	}
}
