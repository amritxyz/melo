package services

import (
	"errors"
	"os"
	"path/filepath"
	"strings"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
	"codeberg.org/amritxyz/melo/internal/utils"
	"gorm.io/gorm"
)

var (
	ErrListingNotFound    = errors.New("listing not found")
	ErrUnauthorizedAction = errors.New("you are not authorized to modify this listing")
	ErrInvalidPrice       = errors.New("price must be greater than 0")
	ErrInvalidCondition   = errors.New("invalid condition: must be new, like_new, good, fair, or poor")
	ErrInvalidStatus      = errors.New("invalid status: must be active, sold, or hidden")
	ErrListingAlreadySold = errors.New("sold listings cannot be edited")
)

type CreateListingRequest struct {
	CategoryID  string                  `json:"category_id"`
	Title       string                  `json:"title"`
	Description string                  `json:"description"`
	Price       float64                 `json:"price"`
	Condition   models.ListingCondition `json:"condition"`
	Location    string                  `json:"location"`
	ImageURLs   []string                `json:"image_urls"`
}

type UpdateListingRequest struct {
	CategoryID  *string                  `json:"category_id"`
	Title       *string                  `json:"title"`
	Description *string                  `json:"description"`
	Price       *float64                 `json:"price"`
	Condition   *models.ListingCondition `json:"condition"`
	Location    *string                  `json:"location"`
	Status      *models.ListingStatus    `json:"status"`
	ImageURLs   *[]string                `json:"image_urls"`
}

type ListingService struct {
	listingRepo  *repositories.ListingRepository
	categoryRepo *repositories.CategoryRepository
}

func NewListingService(
	listingRepo *repositories.ListingRepository,
	categoryRepo *repositories.CategoryRepository,
) *ListingService {
	return &ListingService{
		listingRepo:  listingRepo,
		categoryRepo: categoryRepo,
	}
}

func isValidCondition(cond models.ListingCondition) bool {
	switch cond {
	case models.ConditionNew, models.ConditionLikeNew, models.ConditionGood, models.ConditionFair, models.ConditionPoor:
		return true
	default:
		return false
	}
}

func isValidStatus(status models.ListingStatus) bool {
	switch status {
	case models.StatusActive, models.StatusSold, models.StatusHidden:
		return true
	default:
		return false
	}
}

func (s *ListingService) CreateListing(sellerID string, req CreateListingRequest) (*models.Listing, error) {
	if req.Price <= 0 {
		return nil, ErrInvalidPrice
	}

	if !isValidCondition(req.Condition) {
		return nil, ErrInvalidCondition
	}

	if _, err := s.categoryRepo.FindByID(req.CategoryID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}

	var images []models.ListingImage
	for idx, u := range req.ImageURLs {
		trimmed := strings.TrimSpace(u)
		if trimmed != "" {
			images = append(images, models.ListingImage{
				URL:       trimmed,
				IsPrimary: idx == 0,
			})
		}
	}

	listing := &models.Listing{
		SellerID:    sellerID,
		CategoryID:  req.CategoryID,
		Title:       utils.FormatTitle(req.Title),
		Description: strings.TrimSpace(req.Description),
		Price:       req.Price,
		Condition:   req.Condition,
		Location:    models.NormalizeLocation(req.Location),
		Status:      models.StatusActive,
		Images:      images,
	}

	if err := s.listingRepo.Create(listing); err != nil {
		return nil, err
	}

	return s.listingRepo.FindByID(listing.ID)
}

func (s *ListingService) GetListingByID(id string) (*models.Listing, error) {
	listing, err := s.listingRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, err
	}
	return listing, nil
}

func (s *ListingService) GetListings(params repositories.ListingFilterParams) ([]models.Listing, int64, error) {
	return s.listingRepo.FindAll(params)
}

func (s *ListingService) UpdateListing(userID, listingID string, req UpdateListingRequest) (*models.Listing, error) {
	listing, err := s.listingRepo.FindByID(listingID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, err
	}

	if listing.SellerID != userID {
		return nil, ErrUnauthorizedAction
	}

	if listing.Status == models.StatusSold {
		return nil, ErrListingAlreadySold
	}

	if req.Price != nil {
		if *req.Price <= 0 {
			return nil, ErrInvalidPrice
		}
		listing.Price = *req.Price
	}

	if req.Condition != nil {
		if !isValidCondition(*req.Condition) {
			return nil, ErrInvalidCondition
		}
		listing.Condition = *req.Condition
	}

	if req.Status != nil {
		if !isValidStatus(*req.Status) {
			return nil, ErrInvalidStatus
		}
		listing.Status = *req.Status
	}

	if req.CategoryID != nil {
		if _, err := s.categoryRepo.FindByID(*req.CategoryID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrCategoryNotFound
			}
			return nil, err
		}
		listing.CategoryID = *req.CategoryID
	}

	if req.Title != nil && strings.TrimSpace(*req.Title) != "" {
		listing.Title = utils.FormatTitle(*req.Title)
	}

	if req.Description != nil && strings.TrimSpace(*req.Description) != "" {
		listing.Description = strings.TrimSpace(*req.Description)
	}

	if req.Location != nil && strings.TrimSpace(*req.Location) != "" {
		listing.Location = models.NormalizeLocation(*req.Location)
	}

	if req.ImageURLs != nil {
		newMap := make(map[string]bool)
		for _, u := range *req.ImageURLs {
			newMap[strings.TrimSpace(u)] = true
		}
		for _, oldImg := range listing.Images {
			if !newMap[oldImg.URL] {
				base := filepath.Base(oldImg.URL)
				if base != "" && base != "." && base != "/" {
					_ = os.Remove(filepath.Join("./uploads", base))
				}
			}
		}

		if err := s.listingRepo.ReplaceImages(listingID, *req.ImageURLs); err != nil {
			return nil, err
		}
	}

	if err := s.listingRepo.Update(listing); err != nil {
		return nil, err
	}

	return s.listingRepo.FindByID(listing.ID)
}

func (s *ListingService) DeleteListing(userID, listingID string) error {
	listing, err := s.listingRepo.FindByID(listingID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrListingNotFound
		}
		return err
	}

	if listing.SellerID != userID {
		return ErrUnauthorizedAction
	}

	for _, img := range listing.Images {
		base := filepath.Base(img.URL)
		if base != "" && base != "." && base != "/" {
			_ = os.Remove(filepath.Join("./uploads", base))
		}
	}

	return s.listingRepo.Delete(listingID)
}

func (s *ListingService) MarkAsSold(userID, listingID string) (*models.Listing, error) {
	soldStatus := models.StatusSold
	return s.UpdateListing(userID, listingID, UpdateListingRequest{
		Status: &soldStatus,
	})
}
