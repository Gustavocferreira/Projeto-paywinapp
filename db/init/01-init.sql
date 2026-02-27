-- Database initialization script
-- Executed when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set locale
SET lc_messages TO 'pt_BR.UTF-8';
SET lc_monetary TO 'pt_BR.UTF-8';
SET lc_numeric TO 'pt_BR.UTF-8';
SET lc_time TO 'pt_BR.UTF-8';

-- Create default categories for new users
-- These will be used as templates

CREATE TABLE IF NOT EXISTS default_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default income categories
INSERT INTO default_categories (name, type, icon, color) VALUES
('Salário', 'income', '💼', '#10b981'),
('Freelance', 'income', '💻', '#059669'),
('Investimentos', 'income', '📈', '#34d399'),
('Outros', 'income', '💰', '#6ee7b7');

-- Insert default expense categories
INSERT INTO default_categories (name, type, icon, color) VALUES
('Alimentação', 'expense', '🍔', '#ef4444'),
('Transporte', 'expense', '🚗', '#f59e0b'),
('Moradia', 'expense', '🏠', '#eab308'),
('Saúde', 'expense', '⚕️', '#06b6d4'),
('Educação', 'expense', '📚', '#8b5cf6'),
('Lazer', 'expense', '🎮', '#ec4899'),
('Compras', 'expense', '🛍️', '#f43f5e'),
('Outros', 'expense', '📦', '#64748b');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO paywinuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO paywinuser;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PayWinApp database initialized successfully!';
END $$;
