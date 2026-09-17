package repositories

import (
	"regexp"
	"strings"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/utils"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
		query = query.Where("listings.category_id = ?", params.CategoryID)
	}

	if params.SellerID != "" {
		query = query.Where("listings.seller_id = ?", params.SellerID)
	}

	if params.Status != "" {
		query = query.Where("listings.status = ?", params.Status)
	} else if params.SellerID == "" {
		// By default for general explore queries without status, only show active
		query = query.Where("listings.status = ?", models.StatusActive)
	} else {
		// For seller inventory without status filter, show active and sold (exclude hidden)
		query = query.Where("listings.status != ?", models.StatusHidden)
	}

	if params.Condition != "" && params.Condition != "all" {
		query = query.Where("listings.condition = ?", params.Condition)
	}

	if params.Location != "" {
		locPattern := "%" + strings.ToLower(strings.TrimSpace(params.Location)) + "%"
		query = query.Where("LOWER(listings.location) LIKE ?", locPattern)
	}

	cleanedSearch := utils.CleanSearchQuery(params.Search)
	tokens := utils.TokenizeSearchQuery(cleanedSearch)

	if len(tokens) > 0 {
		query = query.Joins("LEFT JOIN categories ON categories.id = listings.category_id")

		for _, tok := range tokens {
			variants := utils.GetSearchVariants(tok)
			var orClauses []string
			var orArgs []interface{}
			for _, v := range variants {
				pat := "%" + strings.ToLower(v) + "%"
				orClauses = append(orClauses,
					"LOWER(listings.title) LIKE ?",
					"LOWER(listings.description) LIKE ?",
					"LOWER(categories.name) LIKE ?",
				)
				orArgs = append(orArgs, pat, pat, pat)
			}
			if len(tok) >= 4 {
				orClauses = append(orClauses, "word_similarity(?, listings.title) >= 0.45")
				orArgs = append(orArgs, tok)
			}
			query = query.Where("("+strings.Join(orClauses, " OR ")+")", orArgs...)
		}
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fallback to relaxed search if multi-token conjunction produced 0 matches
	if total == 0 && len(tokens) > 1 {
		fallbackQuery := r.db.Model(&models.Listing{})
		if params.CategoryID != "" {
			fallbackQuery = fallbackQuery.Where("listings.category_id = ?", params.CategoryID)
		}
		if params.SellerID != "" {
			fallbackQuery = fallbackQuery.Where("listings.seller_id = ?", params.SellerID)
		}
		if params.Status != "" {
			fallbackQuery = fallbackQuery.Where("listings.status = ?", params.Status)
		} else if params.SellerID == "" {
			fallbackQuery = fallbackQuery.Where("listings.status = ?", models.StatusActive)
		} else {
			fallbackQuery = fallbackQuery.Where("listings.status != ?", models.StatusHidden)
		}
		if params.Condition != "" && params.Condition != "all" {
			fallbackQuery = fallbackQuery.Where("listings.condition = ?", params.Condition)
		}
		if params.Location != "" {
			locPattern := "%" + strings.ToLower(strings.TrimSpace(params.Location)) + "%"
			fallbackQuery = fallbackQuery.Where("LOWER(listings.location) LIKE ?", locPattern)
		}

		fallbackQuery = fallbackQuery.Joins("LEFT JOIN categories ON categories.id = listings.category_id")
		var orClauses []string
		var orArgs []interface{}
		for _, tok := range tokens {
			variants := utils.GetSearchVariants(tok)
			for _, v := range variants {
				pat := "%" + strings.ToLower(v) + "%"
				orClauses = append(orClauses,
					"LOWER(listings.title) LIKE ?",
					"LOWER(listings.description) LIKE ?",
					"LOWER(categories.name) LIKE ?",
				)
				orArgs = append(orArgs, pat, pat, pat)
			}
			if len(tok) >= 4 {
				orClauses = append(orClauses, "word_similarity(?, listings.title) >= 0.45")
				orArgs = append(orArgs, tok)
			}
		}
		fallbackQuery = fallbackQuery.Where("("+strings.Join(orClauses, " OR ")+")", orArgs...)

		var fallbackTotal int64
		if err := fallbackQuery.Count(&fallbackTotal).Error; err == nil && fallbackTotal > 0 {
			query = fallbackQuery
			total = fallbackTotal
		}
	}

	orderClause := "listings.created_at DESC"
	switch params.SortBy {
	case "price_asc":
		orderClause = "listings.price ASC, listings.created_at DESC"
		query = query.Order(orderClause)
	case "price_desc":
		orderClause = "listings.price DESC, listings.created_at DESC"
		query = query.Order(orderClause)
	default:
		if len(tokens) > 0 {
			var scoreParts []string
			var scoreArgs []interface{}

			// Exact full title match
			scoreParts = append(scoreParts, "CASE WHEN LOWER(listings.title) = ? THEN 100.0 ELSE 0.0 END")
			scoreArgs = append(scoreArgs, strings.ToLower(cleanedSearch))

			// Full phrase in title
			fullPat := "%" + strings.ToLower(cleanedSearch) + "%"
			scoreParts = append(scoreParts, "CASE WHEN LOWER(listings.title) LIKE ? THEN 50.0 ELSE 0.0 END")
			scoreArgs = append(scoreArgs, fullPat)

			// Full phrase in category
			scoreParts = append(scoreParts, "CASE WHEN LOWER(categories.name) LIKE ? THEN 30.0 ELSE 0.0 END")
			scoreArgs = append(scoreArgs, fullPat)

			// Full phrase in description
			scoreParts = append(scoreParts, "CASE WHEN LOWER(listings.description) LIKE ? THEN 15.0 ELSE 0.0 END")
			scoreArgs = append(scoreArgs, fullPat)

			for _, tok := range tokens {
				variants := utils.GetSearchVariants(tok)
				for _, v := range variants {
					pat := "%" + strings.ToLower(v) + "%"
					safeTok := regexp.QuoteMeta(v)

					// Word boundary match in title
					scoreParts = append(scoreParts, "CASE WHEN listings.title ~* ? THEN 35.0 ELSE 0.0 END")
					scoreArgs = append(scoreArgs, `\m`+safeTok+`\M`)

					// Substring match in title
					scoreParts = append(scoreParts, "CASE WHEN LOWER(listings.title) LIKE ? THEN 20.0 ELSE 0.0 END")
					scoreArgs = append(scoreArgs, pat)

					// Category match
					scoreParts = append(scoreParts, "CASE WHEN LOWER(categories.name) LIKE ? THEN 15.0 ELSE 0.0 END")
					scoreArgs = append(scoreArgs, pat)

					// Description match
					scoreParts = append(scoreParts, "CASE WHEN LOWER(listings.description) LIKE ? THEN 8.0 ELSE 0.0 END")
					scoreArgs = append(scoreArgs, pat)
				}

				scoreParts = append(scoreParts, "(word_similarity(?, listings.title) * 25.0)")
				scoreArgs = append(scoreArgs, tok)
			}

			scoreExpr := "(" + strings.Join(scoreParts, " + ") + ")"
			query = query.Clauses(clause.OrderBy{Expression: gorm.Expr(scoreExpr + " DESC, listings.created_at DESC", scoreArgs...)})
		} else {
			query = query.Order(orderClause)
		}
	}

	var listings []models.Listing
	err := query.
		Select("listings.*").
		Preload("Category").
		Preload("Images").
		Preload("Seller", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "email", "phone_number", "avatar_url", "bio", "location", "created_at")
		}).
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
