package models

import (
	"time"
)

type User struct {
	ID          string    `json:"id" gorm:"primaryKey"` // TODO google's UUID
	UserName    string    `json:"username"`
	Email       string    `json:"email" grom:"uniqueIndex"`
	PhoneNumber *string   `json:"phone"`
	Password    string    `json:"password"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// TODO for future. currently, not that important
	// AvatarURL   *string
	// DeletedAt   gorm.DeletedAt `gorm:"index"`
}
