package main

import (
	"log"

	"codeberg.org/amritxyz/melo/internal/config"
	"codeberg.org/amritxyz/melo/internal/database"
	"codeberg.org/amritxyz/melo/internal/routes"
)

func main() {
	// load envs / configs
	cfg := config.Load()

	// connect to PostgreSQL
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("failed to connect to the database:", err)
	}

	// migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("failed to migrate database:", err)
	}

	// setup routes
	r := routes.Setup(db, cfg)

	// start the server
	log.Println("server running on port", cfg.Port)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("failed to start server:", err)
	}
}
