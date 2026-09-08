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
	categoryRepo := repositories.NewCategoryRepository(db)
	listingRepo := repositories.NewListingRepository(db)

	// Services
	authService := services.NewAuthService(userRepo, refreshTokenRepo, cfg)
	categoryService := services.NewCategoryService(categoryRepo)
	listingService := services.NewListingService(listingRepo, categoryRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	listingHandler := handlers.NewListingHandler(listingService)

	// Auth Middleware
	authMiddleware := middleware.Auth(cfg.JWTSecret)
	optionalAuthMiddleware := middleware.OptionalAuth(cfg.JWTSecret)

	// Route registrar to support both /api and /api/v1
	registerRoutes := func(rg *gin.RouterGroup) {
		// Auth routes
		auth := rg.Group("/auth")
		{
			auth.POST("/signup", authHandler.Signup)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", authMiddleware, authHandler.Me)
		}

		// Categories routes (public)
		categories := rg.Group("/categories")
		{
			categories.GET("", categoryHandler.GetAll)
			categories.GET("/:id", categoryHandler.GetByID)
		}

		// Listings routes
		listings := rg.Group("/listings")
		{
			// Public / Explore (optional auth to identify seller for their own inventory)
			listings.GET("", optionalAuthMiddleware, listingHandler.GetAll)
			listings.GET("/:id", listingHandler.GetByID)

			// Protected
			listings.POST("", authMiddleware, listingHandler.Create)
			listings.PATCH("/:id", authMiddleware, listingHandler.Update)
			listings.DELETE("/:id", authMiddleware, listingHandler.Delete)
			listings.PATCH("/:id/sold", authMiddleware, listingHandler.MarkAsSold)
		}
	}

	registerRoutes(r.Group("/api"))
	registerRoutes(r.Group("/api/v1"))

	return r
}
