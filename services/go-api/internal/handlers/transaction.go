package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"paywinapp-go/internal/models"
)

type TransactionHandler struct {
	pool *pgxpool.Pool
}

func NewTransactionHandler(pool *pgxpool.Pool) *TransactionHandler {
	return &TransactionHandler{pool: pool}
}

// GetSummary - High performance endpoint for transaction summary
// Optimized for concurrent requests
func (h *TransactionHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get user_id from query (in production, get from JWT)
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	// Get period (default: last 30 days)
	periodDays := 30
	if days := r.URL.Query().Get("period_days"); days != "" {
		if pd, err := strconv.Atoi(days); err == nil && pd > 0 && pd <= 365 {
			periodDays = pd
		}
	}

	summary, err := h.calculateSummary(ctx, userID, periodDays)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

func (h *TransactionHandler) calculateSummary(ctx context.Context, userID int, periodDays int) (*models.Summary, error) {
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -periodDays)

	query := `
		SELECT 
			COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
			COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
		FROM transactions
		WHERE user_id = $1
		  AND occurred_at >= $2
		  AND occurred_at <= $3
	`

	var totalIncome, totalExpense float64
	err := h.pool.QueryRow(ctx, query, userID, startDate, endDate).Scan(&totalIncome, &totalExpense)
	if err != nil {
		return nil, err
	}

	balance := totalIncome - totalExpense
	savings := 0.0
	if balance > 0 {
		savings = balance
	}

	return &models.Summary{
		TotalIncome:  totalIncome,
		TotalExpense: totalExpense,
		Balance:      balance,
		Savings:      savings,
		PeriodStart:  startDate.Format(time.RFC3339),
		PeriodEnd:    endDate.Format(time.RFC3339),
		UserID:       userID,
	}, nil
}

// BulkCreate - Create multiple transactions in a single request
// Optimized for performance with batch inserts
func (h *TransactionHandler) BulkCreate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req models.BulkTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.Transactions) == 0 {
		http.Error(w, "no transactions provided", http.StatusBadRequest)
		return
	}

	if len(req.Transactions) > 1000 {
		http.Error(w, "maximum 1000 transactions per request", http.StatusBadRequest)
		return
	}

	result := h.bulkInsert(ctx, req.UserID, req.Transactions)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *TransactionHandler) bulkInsert(ctx context.Context, userID int, transactions []models.TransactionCreateReq) *models.BulkResult {
	result := &models.BulkResult{
		TotalReceived: len(transactions),
		Errors:        []string{},
	}

	// Begin transaction
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		result.Failed = len(transactions)
		result.Errors = append(result.Errors, "failed to begin transaction")
		return result
	}
	defer tx.Rollback(ctx)

	// Prepare statement
	stmt := `
		INSERT INTO transactions (user_id, amount, type, description, category_id, occurred_at, source)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	for i, t := range transactions {
		_, err := tx.Exec(ctx, stmt,
			userID,
			t.Amount,
			t.Type,
			t.Description,
			t.CategoryID,
			t.OccurredAt,
			t.Source,
		)

		if err != nil {
			result.Failed++
			result.Errors = append(result.Errors, "transaction "+strconv.Itoa(i)+": "+err.Error())
		} else {
			result.Success++
		}
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		result.Failed = len(transactions)
		result.Success = 0
		result.Errors = []string{"failed to commit transaction"}
		return result
	}

	return result
}

// GetMonthlyReport - Generate monthly financial report
// Heavy aggregation optimized for performance
func (h *TransactionHandler) GetMonthlyReport(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	// Get last N months (default: 12)
	months := 12
	if m := r.URL.Query().Get("months"); m != "" {
		if parsed, err := strconv.Atoi(m); err == nil && parsed > 0 && parsed <= 24 {
			months = parsed
		}
	}

	report, err := h.getMonthlyReport(ctx, userID, months)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

func (h *TransactionHandler) getMonthlyReport(ctx context.Context, userID int, months int) ([]models.MonthlyReport, error) {
	query := `
		SELECT 
			TO_CHAR(occurred_at, 'YYYY-MM') as month,
			COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
			COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
			COUNT(*) as trans_count
		FROM transactions
		WHERE user_id = $1
		  AND occurred_at >= NOW() - INTERVAL '1 month' * $2
		GROUP BY TO_CHAR(occurred_at, 'YYYY-MM')
		ORDER BY month DESC
	`

	rows, err := h.pool.Query(ctx, query, userID, months)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var report []models.MonthlyReport
	for rows.Next() {
		var r models.MonthlyReport
		err := rows.Scan(&r.Month, &r.TotalIncome, &r.TotalExpense, &r.TransCount)
		if err != nil {
			return nil, err
		}
		r.Balance = r.TotalIncome - r.TotalExpense
		report = append(report, r)
	}

	return report, rows.Err()
}

// GetCategoryTrends - Analyze spending trends by category
func (h *TransactionHandler) GetCategoryTrends(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	trends, err := h.getCategoryTrends(ctx, userID, 6)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trends)
}

func (h *TransactionHandler) getCategoryTrends(ctx context.Context, userID int, months int) ([]models.CategoryTrend, error) {
	query := `
		SELECT 
			c.id as category_id,
			c.name as category_name,
			TO_CHAR(t.occurred_at, 'YYYY-MM') as month,
			COALESCE(SUM(t.amount), 0) as total,
			COUNT(*) as trans_count
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = $1
		  AND t.type = 'expense'
		  AND t.occurred_at >= NOW() - INTERVAL '1 month' * $2
		GROUP BY c.id, c.name, TO_CHAR(t.occurred_at, 'YYYY-MM')
		ORDER BY month DESC, total DESC
	`

	rows, err := h.pool.Query(ctx, query, userID, months)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trends []models.CategoryTrend
	for rows.Next() {
		var t models.CategoryTrend
		err := rows.Scan(&t.CategoryID, &t.CategoryName, &t.Month, &t.Total, &t.TransCount)
		if err != nil {
			return nil, err
		}
		trends = append(trends, t)
	}

	return trends, rows.Err()
}
