**TODO project structure for 'Melo' backend with Go - Gin**

```text
backend/
├── cmd/
│   └── server/
│       └── main.go
│
├── internal/
│   ├── config/
│   │   └── config.go
│   │
│   ├── database/
│   │   ├── postgres.go
│   │   └── migrations.go
│   │
│   ├── models/
│   │   ├── user.go
│   │   ├── listing.go
│   │   ├── category.go
│   │   ├── listing_image.go
│   │   ├── favorite.go
│   │   ├── conversation.go
│   │   ├── message.go
│   │   └── report.go
│   │
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── listing.go
│   │   ├── category.go
│   │   ├── favorite.go
│   │   ├── user.go
│   │   ├── conversation.go
│   │   └── report.go
│   │
│   ├── services/
│   │   ├── auth.go
│   │   ├── listing.go
│   │   ├── favorite.go
│   │   ├── user.go
│   │   ├── conversation.go
│   │   └── report.go
│   │
│   ├── repositories/
│   │   ├── user.go
│   │   ├── listing.go
│   │   ├── category.go
│   │   ├── favorite.go
│   │   ├── conversation.go
│   │   └── report.go
│   │
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   └── logger.go
│   │
│   ├── routes/
│   │   └── routes.go
│   │
│   └── websocket/
│       └── chat.go
│
├── migrations/
│
├── .env
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
└── README.md
```
