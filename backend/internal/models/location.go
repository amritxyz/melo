package models

import (
	"strings"

	"codeberg.org/amritxyz/melo/internal/utils"
)

// Supported cities and provinces in Nepal
const (
	CityButwal      = "Butwal"
	ProvinceLumbini = "Lumbini"
)

// LocationItem represents a structured location entry designed for extensible Nepal coverage.
type LocationItem struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Area     string `json:"area"`
	City     string `json:"city"`
	Province string `json:"province"`
}

// ButwalLocations contains the initial curated list of locations in Butwal.
var ButwalLocations = []LocationItem{
	{ID: "traffic-chowk", Name: "Traffic Chowk, Butwal", Area: "Traffic Chowk", City: CityButwal, Province: ProvinceLumbini},
	{ID: "golpark", Name: "Golpark, Butwal", Area: "Golpark", City: CityButwal, Province: ProvinceLumbini},
	{ID: "devinagar", Name: "Devinagar, Butwal", Area: "Devinagar", City: CityButwal, Province: ProvinceLumbini},
	{ID: "kalikanagar", Name: "Kalikanagar, Butwal", Area: "Kalikanagar", City: CityButwal, Province: ProvinceLumbini},
	{ID: "milanchowk", Name: "Milanchowk, Butwal", Area: "Milanchowk", City: CityButwal, Province: ProvinceLumbini},
	{ID: "chauraha", Name: "Chauraha, Butwal", Area: "Chauraha", City: CityButwal, Province: ProvinceLumbini},
	{ID: "deepnagar", Name: "Deepnagar, Butwal", Area: "Deepnagar", City: CityButwal, Province: ProvinceLumbini},
	{ID: "tamnagar", Name: "Tamnagar, Butwal", Area: "Tamnagar", City: CityButwal, Province: ProvinceLumbini},
	{ID: "nayagaon", Name: "Nayagaon, Butwal", Area: "Nayagaon", City: CityButwal, Province: ProvinceLumbini},
	{ID: "manigram", Name: "Manigram, Butwal", Area: "Manigram", City: CityButwal, Province: ProvinceLumbini},
	{ID: "drivertole", Name: "Drivertole, Butwal", Area: "Drivertole", City: CityButwal, Province: ProvinceLumbini},
	{ID: "yogikuti", Name: "Yogikuti, Butwal", Area: "Yogikuti", City: CityButwal, Province: ProvinceLumbini},
	{ID: "belbas", Name: "Belbas, Butwal", Area: "Belbas", City: CityButwal, Province: ProvinceLumbini},
	{ID: "sukhanagar", Name: "Sukhanagar, Butwal", Area: "Sukhanagar", City: CityButwal, Province: ProvinceLumbini},
	{ID: "amarpath", Name: "Amarpath, Butwal", Area: "Amarpath", City: CityButwal, Province: ProvinceLumbini},
	{ID: "haatbazaar", Name: "Haatbazaar, Butwal", Area: "Haatbazaar", City: CityButwal, Province: ProvinceLumbini},
	{ID: "motipur", Name: "Motipur, Butwal", Area: "Motipur", City: CityButwal, Province: ProvinceLumbini},
	{ID: "semlar", Name: "Semlar, Butwal", Area: "Semlar", City: CityButwal, Province: ProvinceLumbini},
	{ID: "other-butwal", Name: "Other, Butwal", Area: "Other", City: CityButwal, Province: ProvinceLumbini},
}

// GetSupportedLocations returns all supported locations.
func GetSupportedLocations() []LocationItem {
	return ButwalLocations
}

// NormalizeLocation normalizes user input against canonical locations or formats into Title Case.
// For example:
// "devinagar" -> "Devinagar, Butwal"
// "devinagar, butwal" -> "Devinagar, Butwal"
// "lalitpur, kathmandu" -> "Lalitpur, Kathmandu"
func NormalizeLocation(input string) string {
	clean := strings.TrimSpace(input)
	if clean == "" {
		return ""
	}

	lower := strings.ToLower(clean)
	// Check against ButwalLocations by full name or area name
	for _, loc := range ButwalLocations {
		if lower == strings.ToLower(loc.Name) || lower == strings.ToLower(loc.Area) {
			return loc.Name
		}
	}

	// If the user typed "area, butwal" where area matches one of our areas:
	for _, loc := range ButwalLocations {
		if lower == strings.ToLower(loc.Area)+", butwal" {
			return loc.Name
		}
	}

	// Otherwise, apply Title Case formatting
	return utils.FormatLocation(clean)
}
