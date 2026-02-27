"""
Dashboard Router
Agregações e resumos financeiros
IMPORTANTE: Cálculos em código Python, não em triggers
"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import Category, Goal, Transaction, TransactionType, User
from app.schemas import (
    CategorySummary,
    DashboardResponse,
    DashboardSummary,
    GoalResponse,
    TransactionResponse,
)

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    period_days: int = Query(30, ge=1, le=365),
):
    """
    Obter dados do dashboard
    Inclui resumo, gastos por categoria, transações recentes e metas ativas
    """
    # Definir período
    period_end = datetime.utcnow()
    period_start = period_end - timedelta(days=period_days)
    
    # Calcular totais do período (lógica explícita em código)
    income_total = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.INCOME,
            Transaction.occurred_at >= period_start,
            Transaction.occurred_at <= period_end,
        )
        .scalar() or 0.0
    )
    
    expense_total = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.occurred_at >= period_start,
            Transaction.occurred_at <= period_end,
        )
        .scalar() or 0.0
    )
    
    balance = income_total - expense_total
    savings = max(balance, 0.0)
    
    # Resumo
    summary = DashboardSummary(
        total_income=income_total,
        total_expense=expense_total,
        balance=balance,
        savings=savings,
        period_start=period_start,
        period_end=period_end,
    )
    
    # Gastos por categoria (apenas despesas)
    expenses_by_category = get_expenses_by_category(
        current_user.id, period_start, period_end, db
    )
    
    # Transações recentes (últimas 10)
    recent_transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.occurred_at.desc())
        .limit(10)
        .all()
    )
    
    # Metas ativas
    active_goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id,
            Goal.is_completed == False
        )
        .order_by(Goal.due_date.asc().nullslast())
        .limit(5)
        .all()
    )
    
    # Adicionar campos calculados às metas
    for goal in active_goals:
        goal.progress_percentage = goal.progress_percentage
        goal.remaining_amount = goal.remaining_amount
    
    return DashboardResponse(
        summary=summary,
        expenses_by_category=expenses_by_category,
        recent_transactions=recent_transactions,
        active_goals=active_goals,
    )


def get_expenses_by_category(
    user_id: int,
    start_date: datetime,
    end_date: datetime,
    db: Session
) -> List[CategorySummary]:
    """
    Calcular gastos por categoria
    Lógica explícita em código
    """
    # Query para agrupar por categoria
    results = (
        db.query(
            Category.id,
            Category.name,
            func.sum(Transaction.amount).label('total')
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.occurred_at >= start_date,
            Transaction.occurred_at <= end_date,
        )
        .group_by(Category.id, Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )
    
    # Calcular total para percentagens
    grand_total = sum(r.total for r in results) or 1.0  # Evitar divisão por zero
    
    # Formatar resposta
    category_summaries = [
        CategorySummary(
            category_id=r.id,
            category_name=r.name,
            total=r.total,
            percentage=(r.total / grand_total) * 100
        )
        for r in results
    ]
    
    return category_summaries


@router.get("/summary")
async def get_summary_only(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    period_days: int = Query(30, ge=1, le=365),
):
    """
    Obter apenas o resumo financeiro (mais leve)
    """
    period_end = datetime.utcnow()
    period_start = period_end - timedelta(days=period_days)
    
    income_total = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.INCOME,
            Transaction.occurred_at >= period_start,
            Transaction.occurred_at <= period_end,
        )
        .scalar() or 0.0
    )
    
    expense_total = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.occurred_at >= period_start,
            Transaction.occurred_at <= period_end,
        )
        .scalar() or 0.0
    )
    
    balance = income_total - expense_total
    
    return {
        "total_income": income_total,
        "total_expense": expense_total,
        "balance": balance,
        "savings": max(balance, 0.0),
        "period": f"Últimos {period_days} dias",
        "period_start": period_start,
        "period_end": period_end,
    }
