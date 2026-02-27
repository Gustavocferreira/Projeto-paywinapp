/**
 * TypeScript Types/Interfaces
 * Compartilhados entre frontend e APIs
 */

// ===== USER =====
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  data_consent_given: boolean;
  data_consent_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  data_consent_given: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// ===== TRANSACTION =====
export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  category_id: number | null;
  occurred_at: string;
  source: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface TransactionCreate {
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  category_id?: number;
  occurred_at: string;
  source?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

// ===== CATEGORY =====
export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  user_id: number | null;
  is_default: boolean;
  icon: string | null;
  color: string | null;
  created_at: string;
}

// ===== GOAL =====
export interface Goal {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  remaining_amount: number;
}

export interface GoalCreate {
  name: string;
  description?: string;
  target_amount: number;
  due_date?: string;
  source?: string;
}

// ===== CHAT =====
export interface ChatMessage {
  id: number;
  user_id: number;
  role: 'user' | 'agent';
  content: string;
  metadata: string | null;
  session_id: string | null;
  created_at: string;
}

export interface ChatMessageCreate {
  content: string;
  session_id?: string;
}

// ===== DASHBOARD =====
export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  savings: number;
  period_start: string;
  period_end: string;
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  total: number;
  percentage: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  expenses_by_category: CategorySummary[];
  recent_transactions: Transaction[];
  active_goals: Goal[];
}

// ===== LGPD =====
export interface DataExportRequest {
  format: 'json' | 'csv';
}

export interface ConsentUpdate {
  data_consent_given: boolean;
}
