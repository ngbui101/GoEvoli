package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"goevoli/internal/database"
	"goevoli/internal/handlers"
	customMiddleware "goevoli/internal/middleware"
	"goevoli/internal/repositories"
	"goevoli/internal/services"

	"golang.org/x/time/rate"
)

func main() {
	fmt.Println("GoEvoli Server starting...")

	envPath := filepath.Join("..", "..", ".env")
	if _, err := os.Stat(".env"); err == nil {
		envPath = ".env"
	} else if _, err := os.Stat("../.env"); err == nil {
		envPath = "../.env"
	}

	godotenv.Load(envPath)

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("FATAL: MONGO_URI is not set in environment")
	}

	dbName := os.Getenv("MONGO_DATABASE")
	if dbName == "" {
		dbName = "goevoli"
	}

	db, err := database.Connect(mongoURI, dbName)
	if err != nil {
		log.Fatalf("FATAL: Could not connect to MongoDB: %v", err)
	}
	defer db.Disconnect(context.Background())

	if err := repositories.SetupIndexes(context.Background(), db.DB); err != nil {
		log.Fatalf("FATAL: Could not setup indexes: %v", err)
	}

	repos := repositories.NewRepositories(db.DB)
	svcs := services.NewServices(repos)

	authHandler := handlers.NewAuthHandler(repos)
	projectHandler := handlers.NewProjectHandler(svcs)
	storyHandler := handlers.NewStoryHandler(svcs)
	taskHandler := handlers.NewTaskHandler(svcs)
	bugHandler := handlers.NewBugHandler(svcs)
	commentHandler := handlers.NewCommentHandler(svcs)
	activityHandler := handlers.NewActivityHandler(svcs)

	// Login/register stay strict; email checks need their own budget so UI mode detection
	// cannot consume password-attempt tokens.
	loginFailureLimiter := customMiddleware.NewLimiter(rate.Limit(1.0/60.0), 5)
	registerLimiter := customMiddleware.NewLimiter(rate.Limit(5.0/60.0), 10)
	checkEmailLimiter := customMiddleware.NewLimiter(rate.Limit(30.0/60.0), 30)
	configureTrustedProxies(loginFailureLimiter, registerLimiter, checkEmailLimiter)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	allowedOrigins := []string{
		"http://localhost:5173",
		"http://localhost:5174",
		"http://localhost:5175",
		"http://localhost:5176",
		"http://localhost:5177",
		"http://localhost:5178",
		"http://127.0.0.1:5173",
		"http://127.0.0.1:5174",
		"http://127.0.0.1:5175",
		"http://127.0.0.1:5176",
		"http://127.0.0.1:5177",
		"http://127.0.0.1:5178",
	}
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}
	if frontendURLs := os.Getenv("FRONTEND_URLS"); frontendURLs != "" {
		for _, frontendURL := range strings.Split(frontendURLs, ",") {
			if trimmedURL := strings.TrimSpace(frontendURL); trimmedURL != "" {
				allowedOrigins = append(allowedOrigins, trimmedURL)
			}
		}
	}
	if os.Getenv("APP_ENV") == "production" {
		if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
			allowedOrigins = []string{frontendURL}
		}
		if os.Getenv("COOKIE_SECURE") != "true" {
			log.Println("WARNING: COOKIE_SECURE is not 'true' in production mode. Cookies may not work over HTTPS.")
		}
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"X-RateLimit-Limit", "X-RateLimit-Remaining"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.RateLimitFailures(loginFailureLimiter, http.StatusUnauthorized))
				r.Post("/login", authHandler.Login)
			})

			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.RateLimit(registerLimiter))
				r.Post("/register", authHandler.Register)
			})

			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.RateLimit(checkEmailLimiter))
				r.Post("/check-email", authHandler.CheckEmail)
			})

			r.Post("/logout", authHandler.Logout)

			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.AuthMiddleware)
				r.Get("/me", authHandler.Me)
			})
		})

		r.Group(func(r chi.Router) {
			r.Use(customMiddleware.AuthMiddleware)

			r.Route("/projects", func(r chi.Router) {
				r.Get("/", projectHandler.GetAll)
				r.Post("/", projectHandler.Create)
				r.Get("/{projectId}", projectHandler.GetByID)
				r.Patch("/{projectId}/wip-limits", projectHandler.UpdateWipLimits)

				r.Route("/{projectId}/stories", func(r chi.Router) {
					r.Get("/", storyHandler.GetProjectStories)
					r.Post("/", storyHandler.Create)
				})

				r.Route("/{projectId}/bugs", func(r chi.Router) {
					r.Get("/", bugHandler.GetAllForProject)
					r.Post("/", bugHandler.Create)
				})
			})

			r.Route("/stories", func(r chi.Router) {
				r.Delete("/{storyId}", storyHandler.Delete)
				r.Post("/{storyId}/pass-test", storyHandler.PassTest)
				r.Post("/{storyId}/complete", storyHandler.Complete)

				r.Route("/{storyId}/tasks", func(r chi.Router) {
					r.Get("/", taskHandler.GetTasks)
					r.Post("/", taskHandler.Create)
				})

				r.Route("/{storyId}/comments", func(r chi.Router) {
					r.Get("/", commentHandler.GetForStory)
					r.Post("/", commentHandler.Create)
				})

				r.Route("/{storyId}/activity", func(r chi.Router) {
					r.Get("/", activityHandler.GetForStory)
				})
			})

			r.Route("/tasks", func(r chi.Router) {
				r.Delete("/{taskId}", taskHandler.Delete)
				r.Post("/{taskId}/move", taskHandler.Move)
			})

			r.Route("/bugs", func(r chi.Router) {
				r.Post("/{bugId}/close", bugHandler.Close)
			})
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = os.Getenv("BACKEND_PORT")
	}
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server listening on :%s\n", port)
	if err := newHTTPServer(port, r).ListenAndServe(); err != nil {
		log.Fatalf("FATAL: Server failed: %v", err)
	}
}

func newHTTPServer(port string, handler http.Handler) *http.Server {
	return &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
}

func configureTrustedProxies(limiters ...*customMiddleware.Limiter) {
	trustedProxies := os.Getenv("TRUSTED_PROXIES")
	if trustedProxies == "" {
		return
	}

	proxies := strings.Split(trustedProxies, ",")
	for _, limiter := range limiters {
		if err := limiter.SetTrustedProxies(proxies); err != nil {
			log.Fatalf("FATAL: Invalid TRUSTED_PROXIES: %v", err)
		}
	}
}
