package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"codeberg.org/amritxyz/melo/internal/middleware"
	"codeberg.org/amritxyz/melo/internal/services"
	"codeberg.org/amritxyz/melo/internal/utils"
	appws "codeberg.org/amritxyz/melo/internal/websocket"
	"github.com/gin-gonic/gin"
)

type ConversationHandler struct {
	convService *services.ConversationService
	hub         *appws.Hub
	jwtSecret   string
}

func NewConversationHandler(
	convService *services.ConversationService,
	hub *appws.Hub,
	jwtSecret string,
) *ConversationHandler {
	return &ConversationHandler{
		convService: convService,
		hub:         hub,
		jwtSecret:   jwtSecret,
	}
}

type StartConversationInput struct {
	ListingID string `json:"listing_id" binding:"required"`
}

type SendMessageInput struct {
	Content string `json:"content" binding:"required"`
}

func (h *ConversationHandler) Start(c *gin.Context) {
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

	var input StartConversationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "invalid listing_id",
			},
		})
		return
	}

	conv, err := h.convService.StartConversation(userID, input.ListingID)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrListingNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, services.ErrSelfMessaging) {
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

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    conv,
	})
}

func (h *ConversationHandler) GetAll(c *gin.Context) {
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

	convs, err := h.convService.GetUserConversations(userID)
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
		"data":    convs,
	})
}

func (h *ConversationHandler) GetByID(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	id := c.Param("id")

	conv, err := h.convService.GetConversation(userID, id)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrConversationNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, services.ErrUnauthorizedParticipant) {
			status = http.StatusForbidden
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
		"data":    conv,
	})
}

func (h *ConversationHandler) GetMessages(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	id := c.Param("id")

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	messages, err := h.convService.GetMessages(userID, id, limit, offset)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrConversationNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, services.ErrUnauthorizedParticipant) {
			status = http.StatusForbidden
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
		"data":    messages,
	})
}

func (h *ConversationHandler) SendMessage(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	id := c.Param("id")

	var input SendMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"message": "content is required",
			},
		})
		return
	}

	msg, err := h.convService.SendMessage(userID, id, input.Content)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrConversationNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, services.ErrUnauthorizedParticipant) {
			status = http.StatusForbidden
		} else if errors.Is(err, services.ErrEmptyMessage) || errors.Is(err, services.ErrMessageTooLong) {
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

	// Broadcast via WebSocket to participants in real-time
	h.hub.BroadcastMessage(id, msg)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    msg,
	})
}

func (h *ConversationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserIDKey)
	id := c.Param("id")

	if err := h.convService.MarkAsRead(userID, id); err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, services.ErrConversationNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, services.ErrUnauthorizedParticipant) {
			status = http.StatusForbidden
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
		"data":    gin.H{"read": true},
	})
}

func (h *ConversationHandler) WebSocket(c *gin.Context) {
	conversationID := c.Param("id")
	userID := c.GetString(middleware.ContextUserIDKey)

	// If not already set by middleware, authenticate via query token (?token=...)
	if userID == "" {
		tokenStr := c.Query("token")
		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"message": "token is required for websocket connection",
				},
			})
			return
		}

		claims, err := utils.ValidateToken(tokenStr, h.jwtSecret)
		if err != nil || claims.TokenType != utils.TokenTypeAccess {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"message": "invalid or expired token",
				},
			})
			return
		}
		userID = claims.UserID
	}

	// Verify caller belongs to the conversation
	if _, err := h.convService.GetConversation(userID, conversationID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error": gin.H{
				"message": "access to conversation forbidden",
			},
		})
		return
	}

	h.hub.HandleWebSocket(c.Writer, c.Request, userID, conversationID)
}
