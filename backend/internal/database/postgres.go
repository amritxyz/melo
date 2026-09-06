package database

import (
	"codeberg.org/amritxyz/melo/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(c config.Config) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(c.DatabaseUrl), &gorm.Config{})
}
