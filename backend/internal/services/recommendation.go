package services

import (
	"math"
	"regexp"
	"sort"
	"strings"

	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
)

// Common English and marketplace stop words to filter during tokenization
var stopWords = map[string]bool{
	"a": true, "an": true, "the": true, "and": true, "or": true, "but": true,
	"is": true, "are": true, "in": true, "on": true, "at": true, "for": true,
	"to": true, "of": true, "with": true, "by": true, "from": true, "it": true,
	"this": true, "that": true, "very": true, "used": true, "sale": true,
}

var wordRegexp = regexp.MustCompile(`[a-zA-Z0-9]+`)

// ConditionRank maps listing conditions to numerical order (1 to 5)
func ConditionRank(cond models.ListingCondition) float64 {
	switch cond {
	case models.ConditionNew:
		return 5.0
	case models.ConditionLikeNew:
		return 4.0
	case models.ConditionGood:
		return 3.0
	case models.ConditionFair:
		return 2.0
	case models.ConditionPoor:
		return 1.0
	default:
		return 3.0
	}
}

// Tokenize extracts alphanumeric words, lowercases them, and removes stop words
func Tokenize(text string) []string {
	matches := wordRegexp.FindAllString(strings.ToLower(text), -1)
	var tokens []string
	for _, m := range matches {
		if !stopWords[m] && len(m) > 1 {
			tokens = append(tokens, m)
		}
	}
	return tokens
}

// ComputeTF calculates term frequencies for a list of tokens
func ComputeTF(tokens []string) map[string]float64 {
	tf := make(map[string]float64)
	if len(tokens) == 0 {
		return tf
	}
	for _, t := range tokens {
		tf[t]++
	}
	total := float64(len(tokens))
	for t, count := range tf {
		tf[t] = count / total
	}
	return tf
}

// TextCosineSimilarity calculates the cosine similarity between two text term-frequency maps:
// cos(A, B) = (A . B) / (||A|| * ||B||)
func TextCosineSimilarity(tf1, tf2 map[string]float64) float64 {
	if len(tf1) == 0 || len(tf2) == 0 {
		return 0.0
	}

	var dotProduct, norm1, norm2 float64

	for term, val1 := range tf1 {
		norm1 += val1 * val1
		if val2, ok := tf2[term]; ok {
			dotProduct += val1 * val2
		}
	}

	for _, val2 := range tf2 {
		norm2 += val2 * val2
	}

	if norm1 == 0 || norm2 == 0 {
		return 0.0
	}

	return dotProduct / (math.Sqrt(norm1) * math.Sqrt(norm2))
}

// CalculateSimilarity computes a multi-attribute weighted Cosine Similarity score
// in range [0.0, 1.0] between a target listing and a candidate listing.
//
// Weights:
// - Category similarity: 0.35
// - Textual similarity (Title + Description): 0.35
// - Price proximity: 0.20
// - Condition proximity: 0.10
func CalculateSimilarity(target, candidate *models.Listing) float64 {
	if target == nil || candidate == nil || target.ID == candidate.ID {
		return 0.0
	}

	// 1. Category Similarity (Exact match gives 1.0)
	var catSim float64
	if target.CategoryID == candidate.CategoryID && target.CategoryID != "" {
		catSim = 1.0
	}

	// 2. Text Cosine Similarity
	targetTokens := Tokenize(target.Title + " " + target.Description)
	candidateTokens := Tokenize(candidate.Title + " " + candidate.Description)
	textSim := TextCosineSimilarity(ComputeTF(targetTokens), ComputeTF(candidateTokens))

	// 3. Price Proximity (Normalized difference: 1.0 - (|P1 - P2| / max(P1, P2)))
	var priceSim float64
	maxPrice := math.Max(target.Price, candidate.Price)
	if maxPrice > 0 {
		diff := math.Abs(target.Price - candidate.Price)
		priceSim = math.Max(0.0, 1.0-(diff/maxPrice))
	}

	// 4. Condition Proximity (Rank difference over maximum rank difference 4.0)
	targetRank := ConditionRank(target.Condition)
	candidateRank := ConditionRank(candidate.Condition)
	condDiff := math.Abs(targetRank - candidateRank)
	condSim := math.Max(0.0, 1.0-(condDiff/4.0))

	// Weighted Linear Combination in normalized vector space
	const (
		wCat   = 0.35
		wText  = 0.35
		wPrice = 0.20
		wCond  = 0.10
	)

	return (wCat * catSim) + (wText * textSim) + (wPrice * priceSim) + (wCond * condSim)
}

// ScoredListing pairs a candidate listing with its computed similarity score
type ScoredListing struct {
	Listing models.Listing
	Score   float64
}

type RecommendationService struct {
	listingRepo *repositories.ListingRepository
}

func NewRecommendationService(listingRepo *repositories.ListingRepository) *RecommendationService {
	return &RecommendationService{
		listingRepo: listingRepo,
	}
}

// GetSimilarListings ranks and returns the top K most similar active listings
// for a given target listing ID using vector space cosine similarity.
func (s *RecommendationService) GetSimilarListings(targetID string, limit int) ([]models.Listing, error) {
	if limit <= 0 {
		limit = 4
	}
	if limit > 20 {
		limit = 20
	}

	target, err := s.listingRepo.FindByID(targetID)
	if err != nil {
		return nil, err
	}

	// Fetch candidate listings in the same category or general active listings
	params := repositories.ListingFilterParams{
		Page:       1,
		Limit:      50, // Candidate evaluation pool
		CategoryID: target.CategoryID,
		Status:     string(models.StatusActive),
	}

	candidates, _, err := s.listingRepo.FindAll(params)
	if err != nil {
		return nil, err
	}

	// If fewer candidates in exact category, fetch general active listings to broaden candidate pool
	if len(candidates) < limit+1 {
		broaderParams := repositories.ListingFilterParams{
			Page:   1,
			Limit:  50,
			Status: string(models.StatusActive),
		}
		broaderList, _, _ := s.listingRepo.FindAll(broaderParams)
		seen := make(map[string]bool)
		for _, c := range candidates {
			seen[c.ID] = true
		}
		for _, b := range broaderList {
			if !seen[b.ID] {
				candidates = append(candidates, b)
				seen[b.ID] = true
			}
		}
	}

	var scored []ScoredListing
	for _, candidate := range candidates {
		if candidate.ID == target.ID {
			continue // Skip the target listing itself
		}
		score := CalculateSimilarity(target, &candidate)
		scored = append(scored, ScoredListing{
			Listing: candidate,
			Score:   score,
		})
	}

	// Sort candidates in descending order of similarity score
	sort.Slice(scored, func(i, j int) bool {
		return scored[i].Score > scored[j].Score
	})

	resultCount := limit
	if len(scored) < resultCount {
		resultCount = len(scored)
	}

	results := make([]models.Listing, resultCount)
	for i := 0; i < resultCount; i++ {
		results[i] = scored[i].Listing
	}

	return results, nil
}
