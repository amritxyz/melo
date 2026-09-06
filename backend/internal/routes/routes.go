package routes

import (
	"codeberg.org/amritxyz/melo/internal/config"
	"codeberg.org/amritxyz/melo/internal/handlers"
	"codeberg.org/amritxyz/melo/internal/repositories"
	"codeberg.org/amritxyz/melo/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, cfg config.Config) *gin.Engine {
	r := gin.Default()

	// deps
	userRepo := repositories.NewUserRepositroy(db)

	authService := services.NewAuthService(userRepo)

	authHandler := handlers.NewAuthHandler(authService)

	// public
	api := r.Group("/api/v1")

	auth := api.Group("/auth")
	{
		auth.POST("/signup", authHandler.Signup)
		// auth.POST("/login")
	}

	// TODO protected
	// protected := api.Group("")
	// protected.Use(middleware.Auth(cfg))
	// protected.POST("/listings", listingHandler.Create)
	// protected.PUT("/listings/:id", listingHandler.Update)
	// protected.DELETE("/listings/:id", listingHandler.Delete)
	//
	// protected.POST("/favorites/:listingId", favoriteHandler.Add)
	// protected.DELETE("/favorites/:listingId", listingHandler.Remove)

	return r
}
