package database

import (
	"gorm.io/gorm"

	"codeberg.org/amritxyz/melo/internal/models"
)

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		models.User{},
	)
}
