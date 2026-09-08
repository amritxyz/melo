package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"codeberg.org/amritxyz/melo/internal/middleware"
	"codeberg.org/amritxyz/melo/internal/services"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	targetID := c.Param("id")
	if targetID == "me" {
		targetID = c.GetString(middleware.ContextUserIDKey)
	}

	if targetID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "user id is required",
			},
		})
		return
	}

	profile, err := h.userService.GetProfile(targetID)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrUserNotFound) {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
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

	var req services.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	profile, err := h.userService.UpdateProfile(userID, req)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrUserNotFound) {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

type AddReviewRequestBody struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment" binding:"required"`
}

func (h *UserHandler) AddReview(c *gin.Context) {
	reviewerID := c.GetString(middleware.ContextUserIDKey)
	if reviewerID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"message": "unauthorized",
			},
		})
		return
	}

	sellerID := c.Param("id")
	if sellerID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "seller id is required",
			},
		})
		return
	}

	var req AddReviewRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	review, err := h.userService.AddReview(reviewerID, sellerID, req.Rating, req.Comment)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrCannotReviewSelf) ||
			errors.Is(err, services.ErrInvalidRating) ||
			errors.Is(err, services.ErrEmptyReviewComment) {
			status = http.StatusBadRequest
		} else if errors.Is(err, services.ErrUserNotFound) {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    review,
	})
}

func (h *UserHandler) GetReviews(c *gin.Context) {
	sellerID := c.Param("id")
	if sellerID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "seller id is required",
			},
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	reviews, total, err := h.userService.GetReviews(sellerID, limit, offset)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrUserNotFound) {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    reviews,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}
