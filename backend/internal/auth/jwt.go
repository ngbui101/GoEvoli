package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Claims struct {
	UserID string `json:"sub"`
	jwt.RegisteredClaims
}

const DefaultSessionDuration = 24 * time.Hour

func SessionDuration() time.Duration {
	duration := os.Getenv("SESSION_DURATION")
	if duration == "" {
		return DefaultSessionDuration
	}

	parsed, err := time.ParseDuration(duration)
	if err != nil || parsed <= 0 {
		return DefaultSessionDuration
	}

	return parsed
}

func GenerateToken(userID primitive.ObjectID) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET is not set")
	}

	now := time.Now()
	claims := &Claims{
		UserID: userID.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(SessionDuration())),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseToken(tokenStr string) (primitive.ObjectID, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return primitive.NilObjectID, errors.New("JWT_SECRET is not set")
	}

	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return primitive.NilObjectID, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		id, err := primitive.ObjectIDFromHex(claims.UserID)
		if err != nil {
			return primitive.NilObjectID, err
		}
		return id, nil
	}

	return primitive.NilObjectID, errors.New("invalid token")
}
