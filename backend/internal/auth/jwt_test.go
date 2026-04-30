package auth

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestSessionDurationDefaultsTo24Hours(t *testing.T) {
	t.Setenv("SESSION_DURATION", "")

	if got := SessionDuration(); got != 24*time.Hour {
		t.Fatalf("SessionDuration() = %v, want %v", got, 24*time.Hour)
	}
}

func TestSessionDurationUsesConfiguredDuration(t *testing.T) {
	t.Setenv("SESSION_DURATION", "8h")

	if got := SessionDuration(); got != 8*time.Hour {
		t.Fatalf("SessionDuration() = %v, want %v", got, 8*time.Hour)
	}
}

func TestParseTokenRejectsExpiredToken(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret")

	userID := primitive.NewObjectID()
	claims := &Claims{
		UserID: userID.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		t.Fatalf("SignedString() error = %v", err)
	}

	if _, err := ParseToken(tokenStr); err == nil {
		t.Fatal("ParseToken() error = nil, want expired token error")
	}
}

func TestParseTokenRejectsMissingSecret(t *testing.T) {
	t.Setenv("JWT_SECRET", "")

	if _, err := ParseToken("invalid-token"); err == nil {
		t.Fatal("ParseToken() error = nil, want missing secret error")
	}
}
