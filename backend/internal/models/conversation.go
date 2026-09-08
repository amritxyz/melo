package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Conversation struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	ListingID string    `json:"listing_id" gorm:"index;not null"`
	Listing   *Listing  `json:"listing,omitempty" gorm:"foreignKey:ListingID;constraint:OnDelete:CASCADE"`
	BuyerID   string    `json:"buyer_id" gorm:"index;not null"`
	Buyer     *User     `json:"buyer,omitempty" gorm:"foreignKey:BuyerID;constraint:OnDelete:CASCADE"`
	SellerID  string    `json:"seller_id" gorm:"index;not null"`
	Seller    *User     `json:"seller,omitempty" gorm:"foreignKey:SellerID;constraint:OnDelete:CASCADE"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Messages    []Message `json:"messages,omitempty" gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE"`
	LastMessage *Message  `json:"last_message,omitempty" gorm:"-"`
	UnreadCount int64     `json:"unread_count" gorm:"-"`
}

func (c *Conversation) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type Message struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	ConversationID string    `json:"conversation_id" gorm:"index;not null"`
	SenderID       string    `json:"sender_id" gorm:"index;not null"`
	Sender         *User     `json:"sender,omitempty" gorm:"foreignKey:SenderID;constraint:OnDelete:CASCADE"`
	Content        string    `json:"content" gorm:"type:text;not null"`
	IsRead         bool      `json:"is_read" gorm:"default:false;not null"`
	CreatedAt      time.Time `json:"created_at"`
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}
