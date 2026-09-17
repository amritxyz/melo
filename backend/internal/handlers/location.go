package handlers

import (
	"net/http"
	"strings"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/services"
	"github.com/gin-gonic/gin"
)

type LocationHandler struct {
	meetupService *services.MeetupService
}

func NewLocationHandler(meetupService *services.MeetupService) *LocationHandler {
	return &LocationHandler{
		meetupService: meetupService,
	}
}

func (h *LocationHandler) GetAll(c *gin.Context) {
	locations := models.GetSupportedLocations()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    locations,
	})
}

func (h *LocationHandler) SuggestMeetup(c *gin.Context) {
	buyerLoc := strings.TrimSpace(c.Query("buyer_location"))
	sellerLoc := strings.TrimSpace(c.Query("seller_location"))

	if buyerLoc == "" || sellerLoc == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "both buyer_location and seller_location query parameters are required",
			},
		})
		return
	}

	suggestion, err := h.meetupService.SuggestOptimalMeetup(buyerLoc, sellerLoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    suggestion,
	})
}
