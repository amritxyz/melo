package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/services"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WSMessage struct {
	Type           string          `json:"type"`
	Content        string          `json:"content,omitempty"`
	Data           *models.Message `json:"data,omitempty"`
	ConversationID string          `json:"conversation_id,omitempty"`
	ReaderID       string          `json:"reader_id,omitempty"`
}

type Client struct {
	Hub            *Hub
	Conn           *websocket.Conn
	Send           chan []byte
	UserID         string
	ConversationID string
}

func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var wsMsg WSMessage
		if err := json.Unmarshal(message, &wsMsg); err != nil {
			continue
		}

		switch wsMsg.Type {
		case "message":
			if wsMsg.Content == "" {
				continue
			}
			msg, err := c.Hub.convService.SendMessage(c.UserID, c.ConversationID, wsMsg.Content)
			if err != nil {
				continue
			}
			c.Hub.BroadcastMessage(c.ConversationID, msg)

		case "read":
			_ = c.Hub.convService.MarkAsRead(c.UserID, c.ConversationID)
			broadcastMsg := WSMessage{
				Type:           "read",
				ConversationID: c.ConversationID,
				ReaderID:       c.UserID,
			}
			raw, _ := json.Marshal(broadcastMsg)
			c.Hub.broadcastToConversation(c.ConversationID, raw)
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)

			// Drain queued messages
			n := len(c.Send)
			for i := 0; i < n; i++ {
				_, _ = w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

type Hub struct {
	clients     map[string]map[*Client]bool
	Register    chan *Client
	Unregister  chan *Client
	convService *services.ConversationService
	mu          sync.RWMutex
}

func NewHub(convService *services.ConversationService) *Hub {
	return &Hub{
		clients:     make(map[string]map[*Client]bool),
		Register:    make(chan *Client),
		Unregister:  make(chan *Client),
		convService: convService,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.clients[client.ConversationID] == nil {
				h.clients[client.ConversationID] = make(map[*Client]bool)
			}
			h.clients[client.ConversationID][client] = true
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if clients, ok := h.clients[client.ConversationID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.clients, client.ConversationID)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) broadcastToConversation(conversationID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	clients, ok := h.clients[conversationID]
	if !ok {
		return
	}

	for client := range clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(clients, client)
		}
	}
}

func (h *Hub) BroadcastMessage(conversationID string, msg *models.Message) {
	payload := WSMessage{
		Type:           "message",
		Data:           msg,
		ConversationID: conversationID,
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		log.Printf("failed to marshal ws message: %v", err)
		return
	}
	h.broadcastToConversation(conversationID, raw)
}

func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request, userID, conversationID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("websocket upgrade error: %v", err)
		return
	}

	client := &Client{
		Hub:            h,
		Conn:           conn,
		Send:           make(chan []byte, 256),
		UserID:         userID,
		ConversationID: conversationID,
	}

	h.Register <- client

	go client.writePump()
	go client.readPump()
}
