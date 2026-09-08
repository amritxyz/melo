package services

import (
	"errors"
	"strings"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
	"gorm.io/gorm"
)

var (
	ErrConversationNotFound     = errors.New("conversation not found")
	ErrUnauthorizedParticipant  = errors.New("you do not have access to this conversation")
	ErrSelfMessaging            = errors.New("you cannot message yourself on your own listing")
	ErrEmptyMessage             = errors.New("message content cannot be empty")
	ErrMessageTooLong           = errors.New("message content cannot exceed 2000 characters")
)

type ConversationService struct {
	convRepo    *repositories.ConversationRepository
	listingRepo *repositories.ListingRepository
}

func NewConversationService(
	convRepo *repositories.ConversationRepository,
	listingRepo *repositories.ListingRepository,
) *ConversationService {
	return &ConversationService{
		convRepo:    convRepo,
		listingRepo: listingRepo,
	}
}

func (s *ConversationService) StartConversation(buyerID, listingID string) (*models.Conversation, error) {
	listing, err := s.listingRepo.FindByID(listingID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, err
	}

	if listing.SellerID == buyerID {
		return nil, ErrSelfMessaging
	}

	return s.convRepo.FindOrCreate(listingID, buyerID, listing.SellerID)
}

func (s *ConversationService) GetUserConversations(userID string) ([]models.Conversation, error) {
	return s.convRepo.FindByUser(userID)
}

func (s *ConversationService) GetConversation(userID, conversationID string) (*models.Conversation, error) {
	conv, err := s.convRepo.FindByID(conversationID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrConversationNotFound
		}
		return nil, err
	}

	if conv.BuyerID != userID && conv.SellerID != userID {
		return nil, ErrUnauthorizedParticipant
	}

	return conv, nil
}

func (s *ConversationService) GetMessages(userID, conversationID string, limit, offset int) ([]models.Message, error) {
	if _, err := s.GetConversation(userID, conversationID); err != nil {
		return nil, err
	}

	return s.convRepo.FindMessagesByConversation(conversationID, limit, offset)
}

func (s *ConversationService) SendMessage(senderID, conversationID, content string) (*models.Message, error) {
	trimmed := strings.TrimSpace(content)
	if trimmed == "" {
		return nil, ErrEmptyMessage
	}

	if len(trimmed) > 2000 {
		return nil, ErrMessageTooLong
	}

	if _, err := s.GetConversation(senderID, conversationID); err != nil {
		return nil, err
	}

	msg := models.Message{
		ConversationID: conversationID,
		SenderID:       senderID,
		Content:        trimmed,
		IsRead:         false,
	}

	if err := s.convRepo.CreateMessage(&msg); err != nil {
		return nil, err
	}

	return &msg, nil
}

func (s *ConversationService) MarkAsRead(readerID, conversationID string) error {
	if _, err := s.GetConversation(readerID, conversationID); err != nil {
		return err
	}

	return s.convRepo.MarkMessagesAsRead(conversationID, readerID)
}
