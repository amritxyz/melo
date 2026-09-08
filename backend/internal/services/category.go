package services

import (
	"errors"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
	"gorm.io/gorm"
)

var ErrCategoryNotFound = errors.New("category not found")

type CategoryService struct {
	categoryRepo *repositories.CategoryRepository
}

func NewCategoryService(categoryRepo *repositories.CategoryRepository) *CategoryService {
	return &CategoryService{
		categoryRepo: categoryRepo,
	}
}

func (s *CategoryService) GetCategories() ([]models.Category, error) {
	return s.categoryRepo.FindAll()
}

func (s *CategoryService) GetCategoryByID(id string) (*models.Category, error) {
	cat, err := s.categoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}
	return cat, nil
}
