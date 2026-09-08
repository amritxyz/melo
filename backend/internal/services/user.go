package services

import (
	"errors"
	"strings"
	"time"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
)

var (
	ErrCannotReviewSelf   = errors.New("cannot review yourself")
	ErrInvalidRating      = errors.New("rating must be between 1 and 5")
	ErrEmptyReviewComment = errors.New("review comment cannot be empty")
)

type UserProfileResponse struct {
	ID             string    `json:"id"`
	Username       string    `json:"username"`
	Email          string    `json:"email"`
	PhoneNumber    *string   `json:"phone,omitempty"`
	AvatarURL      *string   `json:"avatar_url,omitempty"`
	Bio            *string   `json:"bio,omitempty"`
	Location       *string   `json:"location,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	Rating         float64   `json:"rating"`
	ReviewCount    int64     `json:"review_count"`
	ActiveListings int64     `json:"active_listings"`
	SoldListings   int64     `json:"sold_listings"`
}

type UpdateProfileRequest struct {
	Bio         *string `json:"bio"`
	AvatarURL   *string `json:"avatar_url"`
	Location    *string `json:"location"`
	PhoneNumber *string `json:"phone"`
}

type UserService interface {
	GetProfile(userID string) (*UserProfileResponse, error)
	UpdateProfile(userID string, req UpdateProfileRequest) (*UserProfileResponse, error)
	AddReview(reviewerID, sellerID string, rating int, comment string) (*models.Review, error)
	GetReviews(sellerID string, limit, offset int) ([]models.Review, int64, error)
}

type userService struct {
	userRepo    *repositories.UserRepository
	reviewRepo  *repositories.ReviewRepository
	listingRepo *repositories.ListingRepository
}

func NewUserService(
	userRepo *repositories.UserRepository,
	reviewRepo *repositories.ReviewRepository,
	listingRepo *repositories.ListingRepository,
) UserService {
	return &userService{
		userRepo:    userRepo,
		reviewRepo:  reviewRepo,
		listingRepo: listingRepo,
	}
}

func (s *userService) GetProfile(userID string) (*UserProfileResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	avgRating, reviewCount, err := s.reviewRepo.GetRatingStats(userID)
	if err != nil {
		return nil, err
	}

	activeCount, err := s.listingRepo.CountBySeller(userID, "ACTIVE")
	if err != nil {
		return nil, err
	}

	soldCount, err := s.listingRepo.CountBySeller(userID, "SOLD")
	if err != nil {
		return nil, err
	}

	return &UserProfileResponse{
		ID:             user.ID,
		Username:       user.Username,
		Email:          user.Email,
		PhoneNumber:    user.PhoneNumber,
		AvatarURL:      user.AvatarURL,
		Bio:            user.Bio,
		Location:       user.Location,
		CreatedAt:      user.CreatedAt,
		Rating:         avgRating,
		ReviewCount:    reviewCount,
		ActiveListings: activeCount,
		SoldListings:   soldCount,
	}, nil
}

func (s *userService) UpdateProfile(userID string, req UpdateProfileRequest) (*UserProfileResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if req.Bio != nil {
		user.Bio = req.Bio
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}
	if req.Location != nil {
		user.Location = req.Location
	}
	if req.PhoneNumber != nil {
		user.PhoneNumber = req.PhoneNumber
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return s.GetProfile(userID)
}

func (s *userService) AddReview(reviewerID, sellerID string, rating int, comment string) (*models.Review, error) {
	if reviewerID == sellerID {
		return nil, ErrCannotReviewSelf
	}

	if rating < 1 || rating > 5 {
		return nil, ErrInvalidRating
	}

	trimmedComment := strings.TrimSpace(comment)
	if trimmedComment == "" {
		return nil, ErrEmptyReviewComment
	}

	// Ensure seller exists
	_, err := s.userRepo.FindByID(sellerID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	review := &models.Review{
		SellerID:   sellerID,
		ReviewerID: reviewerID,
		Rating:     rating,
		Comment:    trimmedComment,
	}

	if err := s.reviewRepo.Upsert(review); err != nil {
		return nil, err
	}

	return review, nil
}

func (s *userService) GetReviews(sellerID string, limit, offset int) ([]models.Review, int64, error) {
	// Verify seller exists
	if _, err := s.userRepo.FindByID(sellerID); err != nil {
		return nil, 0, ErrUserNotFound
	}

	return s.reviewRepo.FindBySellerID(sellerID, limit, offset)
}
