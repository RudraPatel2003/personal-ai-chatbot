package router

import (
	"net/http"
	"strconv"

	"main/internal/database"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Health check endpoint
	r.GET("/healthcheck", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// Logs endpoint
	r.GET("/logs", func(c *gin.Context) {
		cursor := c.DefaultQuery("cursor", "0")
		limit := c.DefaultQuery("limit", "10")

		cursorNum, err := strconv.Atoi(cursor)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid cursor parameter"})
			return
		}

		limitNum, err := strconv.Atoi(limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit parameter"})
			return
		}

		logs, nextCursor, err := database.GetLogs(cursorNum, limitNum)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch logs"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data":       logs,
			"nextCursor": nextCursor,
		})
	})

	return r
}
