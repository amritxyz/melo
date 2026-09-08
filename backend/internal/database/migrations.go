package database

import (
	"codeberg.org/amritxyz/melo/internal/models"
	"gorm.io/gorm"
)

var defaultCategories = []string{
	"Electronics",
	"Vehicles",
	"Home",
	"Fashion",
	"Education",
	"Other",
}

func Migrate(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.Category{},
		&models.Listing{},
	); err != nil {
		return err
	}

	return seedCategories(db)
}

func seedCategories(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.Category{}).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	for _, name := range defaultCategories {
		cat := models.Category{
			Name: name,
		}
		if err := db.Create(&cat).Error; err != nil {
			return err
		}
	}

	return nil
}
