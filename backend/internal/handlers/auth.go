package handlers

import (
	"net/http"

	"codeberg.org/amritxyz/melo/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// DTO
type SignupRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func (h *AuthHandler) Signup(c *gin.Context) {
	var req SignupRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// TODO future things
	//
	// user, token, err := h.authService.Signup(
	// 	req.Name,
	// 	req.Email,
	// 	req.Password,
	// )
	//
	// if err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{
	// 		"error": err.Error(),
	// 	})
	// 	return
	// }
	//
	// c.JSON(http.StatusCreated, gin.H{
	// 	"message": "account created successfully",
	// 	"data": gin.H{
	// 		"user", user,
	// 		"token", token,
	// 	},
	// })
}
