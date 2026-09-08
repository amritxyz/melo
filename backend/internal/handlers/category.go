package handlers

import (
	"errors"
	"net/http"

	"codeberg.org/amritxyz/melo/internal/services"
	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService *services.CategoryService
}

func NewCategoryHandler(categoryService *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

func (h *CategoryHandler) GetAll(c *gin.Context) {
	categories, err := h.categoryService.GetCategories()
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
		"data":    categories,
	})
}

func (h *CategoryHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	category, err := h.categoryService.GetCategoryByID(id)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrCategoryNotFound) {
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
		"data":    category,
	})
}
