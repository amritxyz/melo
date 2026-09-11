package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ListingImage struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	ListingID string    `json:"listing_id" gorm:"index;not null"`
	URL       string    `json:"url" gorm:"not null"`
	IsPrimary bool      `json:"is_primary" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}

func (img *ListingImage) BeforeCreate(tx *gorm.DB) error {
	if img.ID == "" {
		img.ID = uuid.New().String()
	}
	return nil
}
