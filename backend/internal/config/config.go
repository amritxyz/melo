package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                 string
	DatabaseUrl          string
	JWTSecret            string
	Environment          string
	AccessTokenDuration  time.Duration
	RefreshTokenDuration time.Duration
}

func Load() Config {
	if err := godotenv.Load(); err != nil {
		if err := godotenv.Load("../../.env"); err != nil {
			_ = godotenv.Load("../.env")
		}
	}

	accessTokenDuration, err := time.ParseDuration(getEnv("ACCESS_TOKEN_DURATION", "15m"))
	if err != nil {
		accessTokenDuration = 15 * time.Minute
	}

	refreshTokenDuration, err := time.ParseDuration(getEnv("REFRESH_TOKEN_DURATION", "168h"))
	if err != nil {
		refreshTokenDuration = 7 * 24 * time.Hour
	}

	cfg := Config{
		Port:                 getEnv("PORT", "8080"),
		DatabaseUrl:          getEnv("DATABASE_URL", ""),
		JWTSecret:            getEnv("JWT_SECRET", "melo-default-jwt-secret-key"),
		Environment:          getEnv("ENVIRONMENT", "development"),
		AccessTokenDuration:  accessTokenDuration,
		RefreshTokenDuration: refreshTokenDuration,
	}

	return cfg
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}
