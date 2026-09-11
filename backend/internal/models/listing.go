package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ListingCondition string

const (
	ConditionNew     ListingCondition = "new"
	ConditionLikeNew ListingCondition = "like_new"
	ConditionGood    ListingCondition = "good"
	ConditionFair    ListingCondition = "fair"
	ConditionPoor    ListingCondition = "poor"
)

type ListingStatus string

const (
	StatusActive ListingStatus = "active"
	StatusSold   ListingStatus = "sold"
	StatusHidden ListingStatus = "hidden"
)

type Listing struct {
	ID          string           `json:"id" gorm:"primaryKey"`
	SellerID    string           `json:"seller_id" gorm:"index;not null"`
	Seller      *User            `json:"seller,omitempty" gorm:"foreignKey:SellerID;constraint:OnDelete:CASCADE"`
	CategoryID  string           `json:"category_id" gorm:"index;not null"`
	Category    *Category        `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Title       string           `json:"title" gorm:"not null"`
	Description string           `json:"description" gorm:"type:text;not null"`
	Price       float64          `json:"price" gorm:"index;not null"`
	Condition   ListingCondition `json:"condition" gorm:"index;not null"`
	Location    string           `json:"location" gorm:"index;not null"`
	Status      ListingStatus    `json:"status" gorm:"index;not null;default:'active'"`
	CreatedAt   time.Time        `json:"created_at" gorm:"index"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

func (l *Listing) BeforeCreate(tx *gorm.DB) error {
	if l.ID == "" {
		l.ID = uuid.New().String()
	}
	if l.Status == "" {
		l.Status = StatusActive
	}
	return nil
}
