package database

import (
	"context"
	"log"
	"main/internal/models"
	"main/internal/utils"

	"github.com/jackc/pgx/v5"
)

var db *pgx.Conn

func InitDB() {
	const DATABASE_URL = "postgres://admin:password@postgres:5432/chatbot-prod"

	var err error
	db, err = pgx.Connect(context.Background(), DATABASE_URL)
	if err != nil {
		utils.FailOnError(err, "Failed to connect to database")
	}

	log.Println("Successfully connected to database")
}

func InsertLog(logMessage models.LogMessage) {
	query := `
		INSERT INTO logs (id, title, description, created_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (id) DO UPDATE
		SET title = $2, description = $3, created_at = $4`

	_, err := db.Exec(context.Background(), query, logMessage.Id, logMessage.Title, logMessage.Description, logMessage.CreatedAt)
	utils.FailOnError(err, "Failed to insert log into database")
}

func GetLogs(cursor int, limit int) ([]models.LogMessage, int, error) {
	query := `
		SELECT id, title, description, created_at
		FROM logs
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	rows, err := db.Query(context.Background(), query, limit, cursor)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var logs []models.LogMessage

	for rows.Next() {
		var log models.LogMessage
		err := rows.Scan(&log.Id, &log.Title, &log.Description, &log.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		logs = append(logs, log)
	}

	err = rows.Err()
	if err != nil {
		return nil, 0, err
	}

	// Get next cursor if we got a full page of results
	var nextCursor int
	if len(logs) == limit {
		nextCursor = cursor + limit
	}

	return logs, nextCursor, nil
}
