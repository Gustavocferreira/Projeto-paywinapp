package models

import "time"

// Transaction represents a financial transaction
type Transaction struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Amount      float64   `json:"amount"`
	Type        string    `json:"type"` // "income" or "expense"
	Description *string   `json:"description"`
	CategoryID  *int      `json:"category_id"`
	OccurredAt  time.Time `json:"occurred_at"`
	Source      string    `json:"source"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Summary represents financial summary
type Summary struct {
	TotalIncome  float64 `json:"total_income"`
	TotalExpense float64 `json:"total_expense"`
	Balance      float64 `json:"balance"`
	Savings      float64 `json:"savings"`
	PeriodStart  string  `json:"period_start"`
	PeriodEnd    string  `json:"period_end"`
	UserID       int     `json:"user_id"`
}

// MonthlyReport represents monthly financial report
type MonthlyReport struct {
	Month        string  `json:"month"`
	TotalIncome  float64 `json:"total_income"`
	TotalExpense float64 `json:"total_expense"`
	Balance      float64 `json:"balance"`
	TransCount   int     `json:"transaction_count"`
}

// CategoryTrend represents spending trends by category
type CategoryTrend struct {
	CategoryID   int     `json:"category_id"`
	CategoryName string  `json:"category_name"`
	Month        string  `json:"month"`
	Total        float64 `json:"total"`
	TransCount   int     `json:"transaction_count"`
}

// BulkTransactionRequest for bulk creation
type BulkTransactionRequest struct {
	UserID       int                    `json:"user_id"`
	Transactions []TransactionCreateReq `json:"transactions"`
}

// TransactionCreateReq for individual transaction in bulk
type TransactionCreateReq struct {
	Amount      float64   `json:"amount"`
	Type        string    `json:"type"`
	Description *string   `json:"description"`
	CategoryID  *int      `json:"category_id"`
	OccurredAt  time.Time `json:"occurred_at"`
	Source      string    `json:"source"`
}

// BulkResult represents result of bulk operation
type BulkResult struct {
	Success       int      `json:"success"`
	Failed        int      `json:"failed"`
	TotalReceived int      `json:"total_received"`
	Errors        []string `json:"errors,omitempty"`
}
