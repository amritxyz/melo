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
		Preload("Images").
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email", "phone_number", "avatar_url", "bio", "location", "created_at")
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
	Location   string
	Condition  string
	SortBy     string
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

	if params.Condition != "" && params.Condition != "all" {
		query = query.Where("condition = ?", params.Condition)
	}

	if params.Search != "" {
		pattern := "%" + strings.ToLower(params.Search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", pattern, pattern)
	}

	if params.Location != "" {
		locPattern := "%" + strings.ToLower(strings.TrimSpace(params.Location)) + "%"
		query = query.Where("LOWER(location) LIKE ?", locPattern)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	orderClause := "created_at DESC"
	switch params.SortBy {
	case "price_asc":
		orderClause = "price ASC, created_at DESC"
	case "price_desc":
		orderClause = "price DESC, created_at DESC"
	}

	var listings []models.Listing
	err := query.
		Preload("Category").
		Preload("Images").
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email", "phone_number", "avatar_url", "bio", "location", "created_at")
		}).
		Order(orderClause).
		Limit(limit).
		Offset(offset).
		Find(&listings).Error

	if err != nil {
		return nil, 0, err
	}

	return listings, total, nil
}

func (r *ListingRepository) ReplaceImages(listingID string, urls []string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("listing_id = ?", listingID).Delete(&models.ListingImage{}).Error; err != nil {
			return err
		}
		for idx, u := range urls {
			trimmed := strings.TrimSpace(u)
			if trimmed == "" {
				continue
			}
			img := models.ListingImage{
				ListingID: listingID,
				URL:       trimmed,
				IsPrimary: idx == 0,
			}
			if err := tx.Create(&img).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *ListingRepository) CountBySeller(sellerID string, status string) (int64, error) {
	var count int64
	query := r.db.Model(&models.Listing{}).Where("seller_id = ?", sellerID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Count(&count).Error
	return count, err
}


func (r *ListingRepository) Update(listing *models.Listing) error {
	return r.db.Save(listing).Error
}

func (r *ListingRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Listing{}).Error
}
