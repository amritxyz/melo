package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"codeberg.org/amritxyz/melo/internal/middleware"
	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
	"codeberg.org/amritxyz/melo/internal/services"
	"github.com/gin-gonic/gin"
)

type ListingHandler struct {
	listingService *services.ListingService
}

func NewListingHandler(listingService *services.ListingService) *ListingHandler {
	return &ListingHandler{
		listingService: listingService,
	}
}

type CreateListingInput struct {
	CategoryID  string                  `json:"category_id" binding:"required"`
	Title       string                  `json:"title" binding:"required,min=3,max=150"`
	Description string                  `json:"description" binding:"required,min=10"`
	Price       float64                 `json:"price" binding:"required,gt=0"`
	Condition   models.ListingCondition `json:"condition" binding:"required"`
	Location    string                  `json:"location" binding:"required"`
}

type UpdateListingInput struct {
	CategoryID  *string                  `json:"category_id"`
	Title       *string                  `json:"title"`
	Description *string                  `json:"description"`
	Price       *float64                 `json:"price"`
	Condition   *models.ListingCondition `json:"condition"`
	Location    *string                  `json:"location"`
	Status      *models.ListingStatus    `json:"status"`
}

func (h *ListingHandler) Create(c *gin.Context) {
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

	var input CreateListingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	listing, err := h.listingService.CreateListing(userID, services.CreateListingRequest{
		CategoryID:  input.CategoryID,
		Title:       input.Title,
		Description: input.Description,
		Price:       input.Price,
		Condition:   input.Condition,
		Location:    input.Location,
	})

	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrInvalidPrice) || errors.Is(err, services.ErrInvalidCondition) {
			status = http.StatusBadRequest
		} else if errors.Is(err, services.ErrCategoryNotFound) {
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
		"data":    listing,
	})
}

func (h *ListingHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	listing, err := h.listingService.GetListingByID(id)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrListingNotFound) {
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
		"data":    listing,
	})
}

func (h *ListingHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	categoryID := c.Query("category_id")
	sellerID := c.Query("seller_id")
	status := c.Query("status")
	search := c.Query("search")
	location := c.Query("location")
	condition := c.Query("condition")
	sortBy := c.Query("sort_by")
	callerUserID := c.GetString(middleware.ContextUserIDKey)

	// If an authenticated seller is viewing their own inventory, allow viewing sold items or custom status.
	// For all buyers, explore pages, and other users, strictly restrict to active items only.
	if sellerID == "" || callerUserID == "" || callerUserID != sellerID {
		status = string(models.StatusActive)
	}

	params := repositories.ListingFilterParams{
		Page:       page,
		Limit:      limit,
		CategoryID: categoryID,
		SellerID:   sellerID,
		Status:     status,
		Search:     search,
		Location:   location,
		Condition:  condition,
		SortBy:     sortBy,
	}

	listings, total, err := h.listingService.GetListings(params)
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
		"data":    listings,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *ListingHandler) Update(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	id := c.Param("id")

	var input UpdateListingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": err.Error(),
			},
		})
		return
	}

	listing, err := h.listingService.UpdateListing(userID, id, services.UpdateListingRequest{
		CategoryID:  input.CategoryID,
		Title:       input.Title,
		Description: input.Description,
		Price:       input.Price,
		Condition:   input.Condition,
		Location:    input.Location,
		Status:      input.Status,
	})

	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrUnauthorizedAction) {
			status = http.StatusForbidden
		} else if errors.Is(err, services.ErrListingNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, services.ErrInvalidPrice) || errors.Is(err, services.ErrInvalidCondition) || errors.Is(err, services.ErrInvalidStatus) || errors.Is(err, services.ErrListingAlreadySold) || errors.Is(err, services.ErrCategoryNotFound) {
			status = http.StatusBadRequest
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
		"data":    listing,
	})
}

func (h *ListingHandler) Delete(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	id := c.Param("id")

	err := h.listingService.DeleteListing(userID, id)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrUnauthorizedAction) {
			status = http.StatusForbidden
		} else if errors.Is(err, services.ErrListingNotFound) {
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
		"data": gin.H{
			"message": "listing deleted successfully",
		},
	})
}

func (h *ListingHandler) MarkAsSold(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	id := c.Param("id")

	listing, err := h.listingService.MarkAsSold(userID, id)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrUnauthorizedAction) {
			status = http.StatusForbidden
		} else if errors.Is(err, services.ErrListingNotFound) {
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
		"data":    listing,
	})
}
