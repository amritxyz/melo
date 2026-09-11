package handlers

import (
	"net/http"

	"codeberg.org/amritxyz/melo/internal/models"
	"github.com/gin-gonic/gin"
)

type LocationHandler struct{}

func NewLocationHandler() *LocationHandler {
	return &LocationHandler{}
}

func (h *LocationHandler) GetAll(c *gin.Context) {
	locations := models.GetSupportedLocations()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    locations,
	})
}
