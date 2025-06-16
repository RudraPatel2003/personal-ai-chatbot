package rabbitmq

import (
	"encoding/json"
	"log"
	"main/internal/database"
	"main/internal/models"
	"main/internal/utils"

	amqp "github.com/rabbitmq/amqp091-go"
)

func SetupRabbitMQ() {
	// Initialize database connection first
	database.InitDB()

	conn, err := amqp.Dial("amqp://admin:password@rabbitmq:5672/")
	utils.FailOnError(err, "Failed to connect to RabbitMQ")

	defer func() {
		err := conn.Close()
		utils.FailOnError(err, "Failed to close connection")
	}()

	ch, err := conn.Channel()
	utils.FailOnError(err, "Failed to open a channel")

	defer func() {
		err := ch.Close()
		utils.FailOnError(err, "Failed to close channel")
	}()

	q, err := ch.QueueDeclare(
		"logging.queue", // name
		true,            // durable
		false,           // delete when unused
		false,           // exclusive
		false,           // no-wait
		nil,             // arguments
	)
	utils.FailOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	utils.FailOnError(err, "Failed to register a consumer")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			var logMessage models.LogMessage

			err := json.Unmarshal(d.Body, &logMessage)
			utils.FailOnError(err, "Failed to unmarshal message")

			database.InsertLog(logMessage)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
