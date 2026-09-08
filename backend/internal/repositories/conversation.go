package repositories

import (
	"time"

	"codeberg.org/amritxyz/melo/internal/models"
	"gorm.io/gorm"
)

type ConversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) *ConversationRepository {
	return &ConversationRepository{
		db: db,
	}
}

func (r *ConversationRepository) FindOrCreate(listingID, buyerID, sellerID string) (*models.Conversation, error) {
	var conversation models.Conversation
	err := r.db.
		Preload("Listing").
		Preload("Buyer", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email")
		}).
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email")
		}).
		Where("listing_id = ? AND buyer_id = ? AND seller_id = ?", listingID, buyerID, sellerID).
		First(&conversation).Error

	if err == nil {
		return &conversation, nil
	}

	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	newConv := models.Conversation{
		ListingID: listingID,
		BuyerID:   buyerID,
		SellerID:  sellerID,
	}

	if err := r.db.Create(&newConv).Error; err != nil {
		return nil, err
	}

	return r.FindByID(newConv.ID)
}

func (r *ConversationRepository) FindByID(id string) (*models.Conversation, error) {
	var conv models.Conversation
	err := r.db.
		Preload("Listing").
		Preload("Buyer", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email")
		}).
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email")
		}).
		Where("id = ?", id).
		First(&conv).Error
	if err != nil {
		return nil, err
	}
	return &conv, nil
}

func (r *ConversationRepository) FindByUser(userID string) ([]models.Conversation, error) {
	var convs []models.Conversation
	err := r.db.
		Preload("Listing").
		Preload("Buyer", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email")
		}).
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email")
		}).
		Where("buyer_id = ? OR seller_id = ?", userID, userID).
		Order("updated_at DESC").
		Find(&convs).Error
	if err != nil {
		return nil, err
	}

	for i := range convs {
		var lastMsg models.Message
		if err := r.db.Where("conversation_id = ?", convs[i].ID).Order("created_at DESC").First(&lastMsg).Error; err == nil {
			convs[i].LastMessage = &lastMsg
		}

		var unreadCount int64
		r.db.Model(&models.Message{}).
			Where("conversation_id = ? AND sender_id != ? AND is_read = false", convs[i].ID, userID).
			Count(&unreadCount)
		convs[i].UnreadCount = unreadCount
	}

	return convs, nil
}

func (r *ConversationRepository) CreateMessage(msg *models.Message) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(msg).Error; err != nil {
			return err
		}
		return tx.Model(&models.Conversation{}).
			Where("id = ?", msg.ConversationID).
			Update("updated_at", time.Now()).Error
	})
}

func (r *ConversationRepository) FindMessagesByConversation(conversationID string, limit, offset int) ([]models.Message, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	var messages []models.Message
	err := r.db.
		Preload("Sender", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email")
		}).
		Where("conversation_id = ?", conversationID).
		Order("created_at ASC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error
	if err != nil {
		return nil, err
	}
	return messages, nil
}

func (r *ConversationRepository) MarkMessagesAsRead(conversationID, readerID string) error {
	return r.db.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id != ? AND is_read = false", conversationID, readerID).
		Update("is_read", true).Error
}
