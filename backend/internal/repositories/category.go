package repositories

import (
	"codeberg.org/amritxyz/melo/internal/models"
	"gorm.io/gorm"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{
		db: db,
	}
}

func (r *CategoryRepository) FindAll() ([]models.Category, error) {
	var categories []models.Category
	if err := r.db.Order("name ASC").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *CategoryRepository) FindByID(id string) (*models.Category, error) {
	var category models.Category
	if err := r.db.Where("id = ?", id).First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) Create(cat *models.Category) error {
	return r.db.Create(cat).Error
}
