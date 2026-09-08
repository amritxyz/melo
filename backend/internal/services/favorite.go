package services

import (
	"errors"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
)

var (
	ErrFavoriteListingNotFound   = errors.New("listing not found")
	ErrCannotFavoriteOwnListing  = errors.New("cannot favorite your own listing")
)

type FavoriteService interface {
	AddFavorite(userID, listingID string) error
	RemoveFavorite(userID, listingID string) error
	IsFavorited(userID, listingID string) (bool, error)
	GetFavoriteListingIDs(userID string) ([]string, error)
	GetUserFavorites(userID string, page, limit int) ([]models.Favorite, int64, error)
}

type favoriteService struct {
	favoriteRepo repositories.FavoriteRepository
	listingRepo  *repositories.ListingRepository
}

func NewFavoriteService(
	favoriteRepo repositories.FavoriteRepository,
	listingRepo *repositories.ListingRepository,
) FavoriteService {
	return &favoriteService{
		favoriteRepo: favoriteRepo,
		listingRepo:  listingRepo,
	}
}

func (s *favoriteService) AddFavorite(userID, listingID string) error {
	listing, err := s.listingRepo.FindByID(listingID)
	if err != nil {
		return ErrFavoriteListingNotFound
	}

	if listing.SellerID == userID {
		return ErrCannotFavoriteOwnListing
	}

	favorite := &models.Favorite{
		UserID:    userID,
		ListingID: listingID,
	}

	return s.favoriteRepo.Add(favorite)
}

func (s *favoriteService) RemoveFavorite(userID, listingID string) error {
	return s.favoriteRepo.Remove(userID, listingID)
}

func (s *favoriteService) IsFavorited(userID, listingID string) (bool, error) {
	return s.favoriteRepo.IsFavorited(userID, listingID)
}

func (s *favoriteService) GetFavoriteListingIDs(userID string) ([]string, error) {
	return s.favoriteRepo.GetFavoriteListingIDs(userID)
}

func (s *favoriteService) GetUserFavorites(userID string, page, limit int) ([]models.Favorite, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	return s.favoriteRepo.GetFavoritesByUser(userID, limit, offset)
}
