package middleware

import (
	"context"
	"net/http"
	"os"

	"goevoli/internal/auth"
	"goevoli/internal/response"
)

type contextKey string

const UserIDKey contextKey = "userID"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookieName := os.Getenv("COOKIE_NAME")
		if cookieName == "" {
			cookieName = "goevoli_session"
		}

		cookie, err := r.Cookie(cookieName)
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "Missing session cookie")
			return
		}

		userID, err := auth.ParseToken(cookie.Value)
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "Invalid or expired session")
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
