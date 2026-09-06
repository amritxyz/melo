package repositories

import (
	"codeberg.org/amritxyz/melo/internal/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepositroy(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(user *models.User) error {
	return nil
}
