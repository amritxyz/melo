package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const MaxUploadSize = 5 << 20 // 5 MB

type UploadHandler struct {
	uploadDir string
}

func NewUploadHandler(uploadDir string) *UploadHandler {
	_ = os.MkdirAll(uploadDir, 0755)
	return &UploadHandler{
		uploadDir: uploadDir,
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
