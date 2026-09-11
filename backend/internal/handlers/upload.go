package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"codeberg.org/amritxyz/melo/internal/middleware"
	"codeberg.org/amritxyz/melo/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const MaxUploadSize = 5 << 20 // 5 MB

type UploadHandler struct {
	uploadDir string
	db        *gorm.DB
}

func NewUploadHandler(uploadDir string, db *gorm.DB) *UploadHandler {
	_ = os.MkdirAll(uploadDir, 0755)
	return &UploadHandler{
		uploadDir: uploadDir,
		db:        db,
	}
}

func (h *UploadHandler) Upload(c *gin.Context) {
	// Limit request body size
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxUploadSize)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "file is required (max 5MB)",
			},
		})
		return
	}

	if fileHeader.Size > MaxUploadSize {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "file exceeds maximum allowed size of 5MB",
			},
		})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to open uploaded file",
			},
		})
		return
	}
	defer file.Close()

	// Detect content type via first 512 bytes (magic bytes validation)
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to inspect file format",
			},
		})
		return
	}

	contentType := http.DetectContentType(buffer[:n])
	var ext string
	switch {
	case strings.HasPrefix(contentType, "image/jpeg"):
		ext = ".jpg"
	case strings.HasPrefix(contentType, "image/png"):
		ext = ".png"
	case strings.HasPrefix(contentType, "image/webp"):
		ext = ".webp"
	case strings.HasPrefix(contentType, "image/gif"):
		ext = ".gif"
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "invalid file format: only JPEG, PNG, WEBP, and GIF images are allowed",
			},
		})
		return
	}

	// Reset file read pointer to beginning
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to process file",
			},
		})
		return
	}

	// Generate safe UUID filename
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	dstPath := filepath.Join(h.uploadDir, filename)

	out, err := os.Create(dstPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to save file to disk",
			},
		})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to write file content",
			},
		})
		return
	}

	// Return public URL relative path
	urlPath := fmt.Sprintf("/uploads/%s", filename)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data": gin.H{
			"url":      urlPath,
			"filename": filename,
			"size":     fileHeader.Size,
			"mimetype": contentType,
		},
	})
}

type DeleteImageRequest struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
}

func (h *UploadHandler) Delete(c *gin.Context) {
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

	rawTarget := strings.TrimSpace(c.Query("url"))
	if rawTarget == "" {
		rawTarget = strings.TrimSpace(c.Query("filename"))
	}
	if rawTarget == "" && c.Request.ContentLength > 0 {
		var req DeleteImageRequest
		if err := c.ShouldBindJSON(&req); err == nil {
			if req.URL != "" {
				rawTarget = strings.TrimSpace(req.URL)
			} else {
				rawTarget = strings.TrimSpace(req.Filename)
			}
		}
	}

	if rawTarget == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "url or filename is required",
			},
		})
		return
	}

	baseFilename := filepath.Base(rawTarget)
	if baseFilename == "." || baseFilename == "/" || baseFilename == ".." {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "invalid filename",
			},
		})
		return
	}

	ext := strings.ToLower(filepath.Ext(baseFilename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" && ext != ".gif" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "invalid file format",
			},
		})
		return
	}

	for _, r := range baseFilename {
		if !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' || r == '.') {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error": gin.H{
					"message": "invalid filename characters",
				},
			})
			return
		}
	}

	if h.db != nil {
		var listingImg models.ListingImage
		pattern := "%" + baseFilename
		err := h.db.Where("url = ? OR url LIKE ?", rawTarget, pattern).First(&listingImg).Error
		if err == nil {
			var listing models.Listing
			if err := h.db.First(&listing, "id = ?", listingImg.ListingID).Error; err == nil {
				if listing.SellerID != userID {
					c.JSON(http.StatusForbidden, gin.H{
						"success": false,
						"error": gin.H{
							"message": "you are not authorized to delete this image",
						},
					})
					return
				}
			}
			_ = h.db.Where("id = ?", listingImg.ID).Delete(&models.ListingImage{}).Error
		}
	}

	dstPath := filepath.Join(h.uploadDir, baseFilename)
	cleanPath := filepath.Clean(dstPath)
	cleanUploadDir := filepath.Clean(h.uploadDir)

	if !strings.HasPrefix(cleanPath, cleanUploadDir) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "invalid file path",
			},
		})
		return
	}

	if err := os.Remove(cleanPath); err != nil && !os.IsNotExist(err) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"message": "failed to delete file from disk",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message":  "image deleted successfully",
			"filename": baseFilename,
		},
	})
}

