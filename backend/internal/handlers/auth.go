package handlers

import (
	"context"
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
	})

	response.JSON(w, http.StatusOK, map[string]string{"message": "Login successful"})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
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
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
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

	if err := h.addDemoProjectMembership(r.Context(), user.ID); err != nil {
		response.Error(w, http.StatusInternalServerError, "Error adding demo project membership")
		return
	}

	response.JSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) addDemoProjectMembership(ctx context.Context, userID primitive.ObjectID) error {
	project, err := h.repos.Projects.FindOne(ctx, bson.M{
		"name": bson.M{
			"$in": []string{
				models.DefaultDemoProjectName,
				"Pok\u00e9mon GoEvoli (Full Demo)",
			},
		},
	})
	if err != nil {
		return err
	}
	if project == nil {
		return nil
	}

	return h.repos.ProjectMemberships.Create(ctx, &models.ProjectMembership{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		ProjectId: project.ID,
		UserId:    userID,
		Role:      models.RoleDeveloper,
	})
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
