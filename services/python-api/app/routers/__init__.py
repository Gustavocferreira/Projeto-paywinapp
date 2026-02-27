"""
Router initialization
"""
from app.routers import auth, chat, dashboard, goals, lgpd, transactions, users

__all__ = ["auth", "users", "transactions", "goals", "chat", "dashboard", "lgpd"]
