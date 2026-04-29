package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"goevoli/internal/auth"
	"goevoli/internal/middleware"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
	"goevoli/internal/response"
)

type AuthHandler struct {
	repos *repositories.Repositories
}

func NewAuthHandler(repos *repositories.Repositories) *AuthHandler {
	return &AuthHandler{repos: repos}
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CheckEmailRequest struct {
	Email string `json:"email"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.repos.Users.FindOne(r.Context(), bson.M{"email": req.Email})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Database error")
		return
	}
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		response.Error(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Could not generate token")
		return
	}

	cookieName := os.Getenv("COOKIE_NAME")
	if cookieName == "" {
		cookieName = "goevoli_session"
	}

	secure := os.Getenv("COOKIE_SECURE") == "true"

	sameSite := http.SameSiteLaxMode
	if os.Getenv("COOKIE_SAME_SITE") == "None" {
		sameSite = http.SameSiteNoneMode
	} else if os.Getenv("COOKIE_SAME_SITE") == "Strict" {
		sameSite = http.SameSiteStrictMode
	}

	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		MaxAge:   86400, // 24 hours
	})

	response.JSON(w, http.StatusOK, map[string]string{"message": "Login successful"})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookieName := os.Getenv("COOKIE_NAME")
	if cookieName == "" {
		cookieName = "goevoli_session"
	}

	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	response.JSON(w, http.StatusOK, map[string]string{"message": "Logout successful"})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userIDVal := r.Context().Value(middleware.UserIDKey)
	if userIDVal == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	userID := userIDVal.(primitive.ObjectID)

	user, err := h.repos.Users.FindByID(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Database error")
		return
	}
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "User not found")
		return
	}

	// Password hash is omitted because it has `json:"-"` in the models.User struct
	response.JSON(w, http.StatusOK, user)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" || req.Name == "" {
		response.Error(w, http.StatusBadRequest, "Name, Email and Password are required")
		return
	}

	// Check if user already exists
	existing, err := h.repos.Users.FindOne(r.Context(), bson.M{"email": req.Email})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Database error")
		return
	}
	if existing != nil {
		response.Error(w, http.StatusConflict, "User already exists")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Error hashing password")
		return
	}

	user := &models.User{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	err = h.repos.Users.Create(r.Context(), user)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Error creating user")
		return
	}

	response.JSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) CheckEmail(w http.ResponseWriter, r *http.Request) {
	var req CheckEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.repos.Users.FindOne(r.Context(), bson.M{"email": req.Email})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Database error")
		return
	}

	exists := user != nil
	response.JSON(w, http.StatusOK, map[string]bool{"exists": exists})
}
