package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	"paywinapp-go/internal/database"
	"paywinapp-go/internal/handlers"
)

func main() {
	// Load configuration
	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "postgres://paywinuser:paywinpass_dev_only@pgbouncer:5432/paywinapp?sslmode=disable")

	// Initialize database connection pool
	ctx := context.Background()
	pool, err := database.NewPool(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to create database pool: %v", err)
	}
	defer pool.Close()

	log.Println("✅ Database connection pool created")

	// Create router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"go-api"}`))
	})

	// Initialize handlers
	transactionHandler := handlers.NewTransactionHandler(pool)

	// Routes - High performance endpoints
	r.Route("/api/v1", func(r chi.Router) {
		// Transaction summary (optimized for high load)
		r.Get("/highload/transactions/summary", transactionHandler.GetSummary)
		
		// Bulk operations
		r.Post("/highload/transactions/bulk", transactionHandler.BulkCreate)
		
		// Heavy aggregations
		r.Get("/highload/reports/monthly", transactionHandler.GetMonthlyReport)
		r.Get("/highload/reports/category-trends", transactionHandler.GetCategoryTrends)
	})

	// Server
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("🚀 Go API server started on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-done
	log.Println("🛑 Shutting down Go API server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}

	log.Println("✅ Server shutdown complete")
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
