package main

import (
	"log"
	"main/internal/database"
	"main/internal/rabbitmq"
	"main/internal/router"
	"main/internal/utils"
)

func main() {
	// Initialize database
	database.InitDB()

	// Setup RabbitMQ
	go func() {
		rabbitmq.SetupRabbitMQ()
	}()

	// Setup and start the router
	r := router.SetupRouter()

	log.Println("Starting server on port 8080")
	err := r.Run(":8080")
	if err != nil {
		utils.FailOnError(err, "Failed to start server")
	}
}
