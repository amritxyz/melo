package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"codeberg.org/amritxyz/melo/internal/middleware"
	"codeberg.org/amritxyz/melo/internal/services"
	"github.com/gin-gonic/gin"
)

type FavoriteHandler struct {
	favService services.FavoriteService
}

func NewFavoriteHandler(favService services.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{
		favService: favService,
	}
}

func (h *FavoriteHandler) GetAll(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"message": "unauthorized",
			},
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	favorites, total, err := h.favService.GetUserFavorites(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to fetch favorites",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    favorites,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *FavoriteHandler) GetFavoriteIDs(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"message": "unauthorized",
			},
		})
		return
	}

	ids, err := h.favService.GetFavoriteListingIDs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to fetch favorite listing IDs",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    ids,
	})
}

func (h *FavoriteHandler) Add(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"message": "unauthorized",
			},
		})
		return
	}

	listingID := c.Param("listingId")
	if listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "listingId parameter is required",
			},
		})
		return
	}

	if err := h.favService.AddFavorite(userID, listingID); err != nil {
		if errors.Is(err, services.ErrFavoriteListingNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"message": "listing not found",
				},
			})
			return
		}
		if errors.Is(err, services.ErrCannotFavoriteOwnListing) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error": gin.H{
					"message": "cannot favorite your own listing",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to add favorite",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "listing added to favorites",
	})
}

func (h *FavoriteHandler) Remove(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"message": "unauthorized",
			},
		})
		return
	}

	listingID := c.Param("listingId")
	if listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "listingId parameter is required",
			},
		})
		return
	}

	if err := h.favService.RemoveFavorite(userID, listingID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to remove favorite",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "listing removed from favorites",
	})
}
