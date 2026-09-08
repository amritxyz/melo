package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Favorite struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	UserID    string    `json:"user_id" gorm:"index;not null;uniqueIndex:idx_user_listing"`
	User      *User     `json:"user,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	ListingID string    `json:"listing_id" gorm:"index;not null;uniqueIndex:idx_user_listing"`
	Listing   *Listing  `json:"listing,omitempty" gorm:"foreignKey:ListingID;constraint:OnDelete:CASCADE"`
	CreatedAt time.Time `json:"created_at"`
}

func (f *Favorite) BeforeCreate(tx *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.New().String()
	}
	return nil
}
