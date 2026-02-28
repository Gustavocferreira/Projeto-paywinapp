package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPool creates a new PostgreSQL connection pool
// Configured to work with PgBouncer
func NewPool(ctx context.Context, connString string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("unable to parse DATABASE_URL: %w", err)
	}

	// Pool configuration optimized for PgBouncer
	// PgBouncer já gerencia o pool, então minimizamos o pool local
	config.MaxConns = 10                       // Limite local (PgBouncer gerencia o real)
	config.MinConns = 2                        // Conexões mínimas
	config.MaxConnLifetime = 0                 // PgBouncer gerencia lifetime
	config.MaxConnIdleTime = 0                 // PgBouncer gerencia idle
	config.HealthCheckPeriod = 1 * time.Minute // Health check a cada 1 minuto

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	// Test connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	return pool, nil
}
