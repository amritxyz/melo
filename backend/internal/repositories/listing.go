package repositories

import (
	"strings"

	"codeberg.org/amritxyz/melo/internal/models"
	"gorm.io/gorm"
)

type ListingRepository struct {
	db *gorm.DB
}

func NewListingRepository(db *gorm.DB) *ListingRepository {
	return &ListingRepository{
		db: db,
	}
}

func (r *ListingRepository) Create(listing *models.Listing) error {
	return r.db.Create(listing).Error
}

func (r *ListingRepository) FindByID(id string) (*models.Listing, error) {
	var listing models.Listing
	err := r.db.
		Preload("Category").
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email", "phone_number", "created_at")
		}).
		Where("id = ?", id).
		First(&listing).Error
	if err != nil {
		return nil, err
	}
	return &listing, nil
}

type ListingFilterParams struct {
	Page       int
	Limit      int
	CategoryID string
	SellerID   string
	Status     string
	Search     string
}

func (r *ListingRepository) FindAll(params ListingFilterParams) ([]models.Listing, int64, error) {
	page := params.Page
	if page < 1 {
		page = 1
	}

	limit := params.Limit
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	query := r.db.Model(&models.Listing{})

	if params.CategoryID != "" {
		query = query.Where("category_id = ?", params.CategoryID)
	}

	if params.SellerID != "" {
		query = query.Where("seller_id = ?", params.SellerID)
	}

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	} else if params.SellerID == "" {
		// By default for general explore queries without status, only show active
		query = query.Where("status = ?", models.StatusActive)
	} else {
		// For seller inventory without status filter, show active and sold (exclude hidden)
		query = query.Where("status != ?", models.StatusHidden)
	}

	if params.Search != "" {
		pattern := "%" + strings.ToLower(params.Search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", pattern, pattern)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var listings []models.Listing
	err := query.
		Preload("Category").
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email", "phone_number", "created_at")
		}).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&listings).Error

	if err != nil {
		return nil, 0, err
	}

	return listings, total, nil
}

func (r *ListingRepository) Update(listing *models.Listing) error {
	return r.db.Save(listing).Error
}

func (r *ListingRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Listing{}).Error
}
