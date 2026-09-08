package routes

import (
	"codeberg.org/amritxyz/melo/internal/config"
	"codeberg.org/amritxyz/melo/internal/handlers"
	"codeberg.org/amritxyz/melo/internal/middleware"
	"codeberg.org/amritxyz/melo/internal/repositories"
	"codeberg.org/amritxyz/melo/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, cfg config.Config) *gin.Engine {
	r := gin.Default()

	// Repositories
	userRepo := repositories.NewUserRepository(db)
	refreshTokenRepo := repositories.NewRefreshTokenRepository(db)

	// Services
	authService := services.NewAuthService(userRepo, refreshTokenRepo, cfg)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)

	// Route registrar to support both /api and /api/v1
	registerAuthRoutes := func(rg *gin.RouterGroup) {
		auth := rg.Group("/auth")
		{
			auth.POST("/signup", authHandler.Signup)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", middleware.Auth(cfg.JWTSecret), authHandler.Me)
		}
	}

	registerAuthRoutes(r.Group("/api"))
	registerAuthRoutes(r.Group("/api/v1"))

	return r
}
