package utils

import (
	"strings"
	"unicode"
)

// CleanSearchQuery normalizes a raw search string by trimming whitespace,
// collapsing multiple spaces, and removing dangerous SQL wildcard or injection characters.
func CleanSearchQuery(q string) string {
	q = strings.TrimSpace(q)
	if q == "" {
		return ""
	}

	// Remove SQL wildcard characters to avoid unexpected pattern behavior
	q = strings.ReplaceAll(q, "%", " ")
	q = strings.ReplaceAll(q, "_", " ")

	return strings.Join(strings.Fields(q), " ")
}

// TokenizeSearchQuery breaks the search query into clean, lowercase individual search tokens.
// Delimiters include whitespace and common punctuation characters, while preserving
// alphanumeric characters and internal hyphens (such as "1-4" or "29-inch").
func TokenizeSearchQuery(q string) []string {
	cleaned := CleanSearchQuery(q)
	if cleaned == "" {
		return nil
	}

	var tokens []string
	var current strings.Builder

	for _, r := range cleaned {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' {
			current.WriteRune(unicode.ToLower(r))
		} else {
			if current.Len() > 0 {
				tok := strings.Trim(current.String(), "-")
				if tok != "" {
					tokens = append(tokens, tok)
				}
				current.Reset()
			}
		}
	}

	if current.Len() > 0 {
		tok := strings.Trim(current.String(), "-")
		if tok != "" {
			tokens = append(tokens, tok)
		}
	}

	// Deduplicate tokens while preserving order
	seen := make(map[string]bool, len(tokens))
	unique := make([]string, 0, len(tokens))
	for _, tok := range tokens {
		if !seen[tok] {
			seen[tok] = true
			unique = append(unique, tok)
		}
	}

	return unique
}

// marketplaceAliases maps common marketplace search terms to their common synonyms or related terms.
var marketplaceAliases = map[string][]string{
	"book":       {"textbook"},
	"books":      {"textbook", "textbooks", "book"},
	"textbook":   {"book"},
	"textbooks":  {"book", "books", "textbook"},
	"bike":       {"bicycle"},
	"bikes":      {"bicycle", "bicycles", "bike"},
	"bicycle":    {"bike"},
	"bicycles":   {"bike", "bikes", "bicycle"},
	"cycle":      {"bicycle", "bike"},
	"cycles":     {"bicycle", "bicycles", "bike", "cycle"},
	"phone":      {"mobile", "smartphone"},
	"phones":     {"mobile", "mobiles", "phone"},
	"mobile":     {"phone", "smartphone"},
	"mobiles":    {"phone", "phones"},
	"laptop":     {"notebook", "macbook", "computer"},
	"laptops":    {"notebook", "notebooks", "macbook", "laptop"},
	"macbook":    {"laptop", "apple"},
	"tv":         {"television"},
	"earphone":   {"headphone", "earbuds"},
	"earphones":  {"headphones", "earbuds", "earphone"},
	"headphone":  {"earphone", "headphones"},
	"headphones": {"headphone", "earphones"},
	"scooter":    {"scooty", "dio", "vespa"},
	"scooters":   {"scooter", "scooty"},
	"pc":         {"computer", "desktop"},
}

// GetSearchVariants produces a deduplicated list of search terms for a given token,
// including the token itself, English plurals/stems, and marketplace synonyms.
func GetSearchVariants(token string) []string {
	token = strings.ToLower(strings.TrimSpace(token))
	if token == "" {
		return nil
	}

	seen := make(map[string]bool)
	var variants []string

	add := func(v string) {
		v = strings.TrimSpace(v)
		if v != "" && !seen[v] {
			seen[v] = true
			variants = append(variants, v)
		}
	}

	add(token)

	// Add marketplace aliases for token
	if aliases, ok := marketplaceAliases[token]; ok {
		for _, a := range aliases {
			add(a)
		}
	}

	n := len(token)

	// English suffix morphology
	switch {
	case strings.HasSuffix(token, "ies") && n > 4:
		stem := token[:n-3] + "y"
		add(stem)
		if aliases, ok := marketplaceAliases[stem]; ok {
			for _, a := range aliases {
				add(a)
			}
		}

	case strings.HasSuffix(token, "sses") && n > 4:
		add(token[:n-2])

	case (strings.HasSuffix(token, "shes") || strings.HasSuffix(token, "ches") ||
		strings.HasSuffix(token, "xes") || strings.HasSuffix(token, "zes")) && n > 4:
		stem := token[:n-2]
		add(stem)
		if aliases, ok := marketplaceAliases[stem]; ok {
			for _, a := range aliases {
				add(a)
			}
		}

	case strings.HasSuffix(token, "ves") && n > 4:
		add(token[:n-3] + "fe")
		add(token[:n-3] + "f")

	case strings.HasSuffix(token, "es") && n > 4:
		stemE := token[:n-1]
		add(stemE)
		if aliases, ok := marketplaceAliases[stemE]; ok {
			for _, a := range aliases {
				add(a)
			}
		}

	case strings.HasSuffix(token, "s") && !strings.HasSuffix(token, "ss") && n > 3:
		stem := token[:n-1]
		add(stem)
		if aliases, ok := marketplaceAliases[stem]; ok {
			for _, a := range aliases {
				add(a)
			}
		}

	case strings.HasSuffix(token, "ing") && n > 5:
		add(token[:n-3])
		add(token[:n-3] + "e")
	}

	// Singular to plural variation
	if !strings.HasSuffix(token, "s") && n >= 3 {
		add(token + "s")
		if strings.HasSuffix(token, "y") && n > 3 {
			add(token[:n-1] + "ies")
		}
		if strings.HasSuffix(token, "sh") || strings.HasSuffix(token, "ch") ||
			strings.HasSuffix(token, "x") || strings.HasSuffix(token, "z") {
			add(token + "es")
		}
	}

	return variants
}
