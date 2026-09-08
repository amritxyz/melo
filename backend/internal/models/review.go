package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Review struct {
	ID         string    `json:"id" gorm:"primaryKey"`
	SellerID   string    `json:"seller_id" gorm:"not null;uniqueIndex:idx_seller_reviewer"`
	Seller     *User     `json:"seller,omitempty" gorm:"foreignKey:SellerID"`
	ReviewerID string    `json:"reviewer_id" gorm:"not null;uniqueIndex:idx_seller_reviewer"`
	Reviewer   *User     `json:"reviewer,omitempty" gorm:"foreignKey:ReviewerID"`
	Rating     int       `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Comment    string    `json:"comment" gorm:"type:text;not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}
