package utils

import (
	"strings"
	"unicode"
)

// CapitalizeWord capitalizes the first letter and lowercases the rest of a word,
// taking into account internal hyphens (e.g. "butwal-10" -> "Butwal-10")
// and apostrophes (e.g. "o'connor" -> "O'Connor").
func CapitalizeWord(w string) string {
	w = strings.TrimSpace(w)
	if w == "" {
		return ""
	}

	if strings.Contains(w, "-") {
		parts := strings.Split(w, "-")
		for i, p := range parts {
			parts[i] = CapitalizeWord(p)
		}
		return strings.Join(parts, "-")
	}

	if strings.Contains(w, "'") {
		parts := strings.Split(w, "'")
		for i, p := range parts {
			parts[i] = CapitalizeWord(p)
		}
		return strings.Join(parts, "'")
	}

	runes := []rune(w)
	runes[0] = unicode.ToUpper(runes[0])
	for i := 1; i < len(runes); i++ {
		runes[i] = unicode.ToLower(runes[i])
	}
	return string(runes)
}

// FormatName formats a person's name or username into Title Case.
// For example: "ram prasad bhattarai" -> "Ram Prasad Bhattarai"
// Collapses multiple consecutive spaces.
func FormatName(name string) string {
	words := strings.Fields(name)
	if len(words) == 0 {
		return ""
	}

	formatted := make([]string, len(words))
	for i, w := range words {
		formatted[i] = CapitalizeWord(w)
	}

	return strings.Join(formatted, " ")
}

// FormatTitle formats a listing or item title into Title Case.
// For example: "vintage bicycle 26 inch" -> "Vintage Bicycle 26 Inch"
func FormatTitle(title string) string {
	words := strings.Fields(title)
	if len(words) == 0 {
		return ""
	}

	formatted := make([]string, len(words))
	for i, w := range words {
		// If word is already all-caps short acronym like "PS5", "BMW", "PC", preserve it
		if len(w) <= 4 && isAllUpper(w) {
			formatted[i] = w
		} else {
			formatted[i] = CapitalizeWord(w)
		}
	}

	return strings.Join(formatted, " ")
}

// isAllUpper checks if all alphabetic characters in a string are uppercase.
func isAllUpper(s string) bool {
	hasLetter := false
	for _, r := range s {
		if unicode.IsLetter(r) {
			hasLetter = true
			if !unicode.IsUpper(r) {
				return false
			}
		}
	}
	return hasLetter
}

// FormatLocation formats a location string into clean Title Case with comma separation.
// For example: "devinagar, butwal" -> "Devinagar, Butwal"
// Collapses excessive whitespace around commas and words.
func FormatLocation(loc string) string {
	loc = strings.TrimSpace(loc)
	if loc == "" {
		return ""
	}

	segments := strings.Split(loc, ",")
	formattedSegments := make([]string, 0, len(segments))

	for _, seg := range segments {
		segWords := strings.Fields(seg)
		if len(segWords) == 0 {
			continue
		}
		formattedWords := make([]string, len(segWords))
		for i, w := range segWords {
			formattedWords[i] = CapitalizeWord(w)
		}
		formattedSegments = append(formattedSegments, strings.Join(formattedWords, " "))
	}

	if len(formattedSegments) == 0 {
		return ""
	}

	return strings.Join(formattedSegments, ", ")
}
