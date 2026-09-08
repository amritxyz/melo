package repositories

import (
	"codeberg.org/amritxyz/melo/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type FavoriteRepository interface {
	Add(favorite *models.Favorite) error
	Remove(userID, listingID string) error
	IsFavorited(userID, listingID string) (bool, error)
	GetFavoriteListingIDs(userID string) ([]string, error)
	GetFavoritesByUser(userID string, limit, offset int) ([]models.Favorite, int64, error)
}

type favoriteRepository struct {
	db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) FavoriteRepository {
	return &favoriteRepository{db: db}
}

func (r *favoriteRepository) Add(favorite *models.Favorite) error {
	return r.db.Clauses(clause.OnConflict{
		DoNothing: true,
	}).Create(favorite).Error
}

func (r *favoriteRepository) Remove(userID, listingID string) error {
	return r.db.Where("user_id = ? AND listing_id = ?", userID, listingID).
		Delete(&models.Favorite{}).Error
}

func (r *favoriteRepository) IsFavorited(userID, listingID string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Favorite{}).
		Where("user_id = ? AND listing_id = ?", userID, listingID).
		Count(&count).Error
	return count > 0, err
}

func (r *favoriteRepository) GetFavoriteListingIDs(userID string) ([]string, error) {
	var listingIDs []string
	err := r.db.Model(&models.Favorite{}).
		Where("user_id = ?", userID).
		Pluck("listing_id", &listingIDs).Error
	if err != nil {
		return nil, err
	}
	if listingIDs == nil {
		listingIDs = []string{}
	}
	return listingIDs, nil
}

func (r *favoriteRepository) GetFavoritesByUser(userID string, limit, offset int) ([]models.Favorite, int64, error) {
	var favorites []models.Favorite
	var total int64

	query := r.db.Model(&models.Favorite{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Listing").
		Preload("Listing.Category").
		Preload("Listing.Seller").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&favorites).Error

	if err != nil {
		return nil, 0, err
	}

	return favorites, total, nil
}
