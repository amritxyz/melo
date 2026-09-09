package services

import (
	"errors"
	"strings"
	"time"

	"codeberg.org/amritxyz/melo/internal/config"
	"codeberg.org/amritxyz/melo/internal/models"
	"codeberg.org/amritxyz/melo/internal/repositories"
	"codeberg.org/amritxyz/melo/internal/utils"
	"gorm.io/gorm"
)

var (
	ErrUserAlreadyExists   = errors.New("email is already registered")
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrUserNotFound        = errors.New("user not found")
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
	ErrUsernameInvalid     = errors.New("username must be between 2 and 25 characters")
)

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type UserResponse struct {
	ID          string    `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	PhoneNumber *string   `json:"phone,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AuthResponse struct {
	User   UserResponse `json:"user"`
	Tokens TokenPair    `json:"tokens"`
}

type AuthService struct {
	userRepo         *repositories.UserRepository
	refreshTokenRepo *repositories.RefreshTokenRepository
	cfg              config.Config
}

func NewAuthService(
	userRepo *repositories.UserRepository,
	refreshTokenRepo *repositories.RefreshTokenRepository,
	cfg config.Config,
) *AuthService {
	return &AuthService{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		cfg:              cfg,
	}
}

func toUserResponse(user *models.User) UserResponse {
	return UserResponse{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}

func (s *AuthService) generateAndRegisterTokens(user *models.User) (*TokenPair, error) {
	accessToken, err := utils.GenerateToken(
		user.ID,
		user.Email,
		utils.TokenTypeAccess,
		s.cfg.JWTSecret,
		s.cfg.AccessTokenDuration,
	)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateToken(
		user.ID,
		user.Email,
		utils.TokenTypeRefresh,
		s.cfg.JWTSecret,
		s.cfg.RefreshTokenDuration,
	)
	if err != nil {
		return nil, err
	}

	// Register refresh token in the database
	rt := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(s.cfg.RefreshTokenDuration),
		Revoked:   false,
	}

	if err := s.refreshTokenRepo.Create(rt); err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Signup(username, email, password string) (*AuthResponse, error) {
	cleanUsername := strings.TrimSpace(username)
	if len([]rune(cleanUsername)) < 2 || len([]rune(cleanUsername)) > 25 {
		return nil, ErrUsernameInvalid
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(email))

	existingUser, err := s.userRepo.FindByEmail(cleanEmail)
	if err == nil && existingUser != nil {
		return nil, ErrUserAlreadyExists
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username:     strings.TrimSpace(username),
		Email:        cleanEmail,
		PasswordHash: hashedPassword,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	tokens, err := s.generateAndRegisterTokens(user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:   toUserResponse(user),
		Tokens: *tokens,
	}, nil
}

func (s *AuthService) Login(email, password string) (*AuthResponse, error) {
	cleanEmail := strings.ToLower(strings.TrimSpace(email))

	user, err := s.userRepo.FindByEmail(cleanEmail)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !utils.CheckPassword(password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	tokens, err := s.generateAndRegisterTokens(user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:   toUserResponse(user),
		Tokens: *tokens,
	}, nil
}

func (s *AuthService) RefreshToken(refreshTokenStr string) (*TokenPair, error) {
	claims, err := utils.ValidateToken(refreshTokenStr, s.cfg.JWTSecret)
	if err != nil || claims.TokenType != utils.TokenTypeRefresh {
		return nil, ErrInvalidRefreshToken
	}

	// Verify that token exists in DB and is active
	rt, err := s.refreshTokenRepo.FindByToken(refreshTokenStr)
	if err != nil || rt.Revoked || time.Now().After(rt.ExpiresAt) {
		return nil, ErrInvalidRefreshToken
	}

	user, err := s.userRepo.FindByID(claims.UserID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	// Revoke old refresh token (token rotation)
	_ = s.refreshTokenRepo.Revoke(refreshTokenStr)

	// Issue new token pair
	return s.generateAndRegisterTokens(user)
}

func (s *AuthService) Logout(refreshTokenStr string) error {
	if refreshTokenStr == "" {
		return nil
	}
	return s.refreshTokenRepo.Revoke(refreshTokenStr)
}

func (s *AuthService) GetMe(userID string) (*UserResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	resp := toUserResponse(user)
	return &resp, nil
}
