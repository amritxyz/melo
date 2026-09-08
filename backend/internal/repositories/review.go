package repositories

import (
	"errors"
	"time"

	"codeberg.org/amritxyz/melo/internal/models"
	"gorm.io/gorm"
)

type ReviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) *ReviewRepository {
	return &ReviewRepository{
		db: db,
	}
}

func (r *ReviewRepository) Upsert(review *models.Review) error {
	var existing models.Review
	err := r.db.Where("seller_id = ? AND reviewer_id = ?", review.SellerID, review.ReviewerID).First(&existing).Error
	if err == nil {
		existing.Rating = review.Rating
		existing.Comment = review.Comment
		existing.UpdatedAt = time.Now()
		if err := r.db.Save(&existing).Error; err != nil {
			return err
		}
		*review = existing
		return nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return r.db.Create(review).Error
}

func (r *ReviewRepository) FindBySellerID(sellerID string, limit, offset int) ([]models.Review, int64, error) {
	if limit <= 0 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	var total int64
	if err := r.db.Model(&models.Review{}).Where("seller_id = ?", sellerID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var reviews []models.Review
	err := r.db.
		Preload("Reviewer", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "avatar_url")
		}).
		Where("seller_id = ?", sellerID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&reviews).Error

	if err != nil {
		return nil, 0, err
	}

	return reviews, total, nil
}

type RatingStats struct {
	AvgRating float64
	Count     int64
}

func (r *ReviewRepository) GetRatingStats(sellerID string) (float64, int64, error) {
	var stats RatingStats
	err := r.db.Model(&models.Review{}).
		Where("seller_id = ?", sellerID).
		Select("COALESCE(AVG(rating), 0) as avg_rating, COUNT(id) as count").
		Scan(&stats).Error

	return stats.AvgRating, stats.Count, err
}

func (r *ReviewRepository) FindBySellerAndReviewer(sellerID, reviewerID string) (*models.Review, error) {
	var review models.Review
	err := r.db.Where("seller_id = ? AND reviewer_id = ?", sellerID, reviewerID).First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}
