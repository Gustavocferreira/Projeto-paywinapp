"""
Goals Router  
CRUD de metas financeiras
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import Goal, User
from app.schemas import GoalCreate, GoalResponse, GoalUpdate

router = APIRouter()


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Criar nova meta financeira
    """
    goal = Goal(
        user_id=current_user.id,
        name=goal_data.name,
        description=goal_data.description,
        target_amount=goal_data.target_amount,
        due_date=goal_data.due_date,
        source=goal_data.source,
    )
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    # Adicionar campos calculados ao response
    goal.progress_percentage = goal.progress_percentage
    goal.remaining_amount = goal.remaining_amount
    
    return goal


@router.get("/", response_model=List[GoalResponse])
async def list_goals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    is_completed: Optional[bool] = Query(None),
):
    """
    Listar metas do usuário
    """
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    
    if is_completed is not None:
        query = query.filter(Goal.is_completed == is_completed)
    
    goals = query.order_by(Goal.created_at.desc()).all()
    
    # Adicionar campos calculados
    for goal in goals:
        goal.progress_percentage = goal.progress_percentage
        goal.remaining_amount = goal.remaining_amount
    
    return goals


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter detalhes de uma meta
    """
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == current_user.id)
        .first()
    )
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )
    
    goal.progress_percentage = goal.progress_percentage
    goal.remaining_amount = goal.remaining_amount
    
    return goal


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar meta
    IMPORTANTE: Lógica de progresso calculada em código
    """
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == current_user.id)
        .first()
    )
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )
    
    # Atualizar campos fornecidos
    update_data = goal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "current_amount":
            # Atualizar progresso usando método do model
            delta = value - goal.current_amount
            goal.update_progress(delta)
        else:
            setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    
    goal.progress_percentage = goal.progress_percentage
    goal.remaining_amount = goal.remaining_amount
    
    return goal


@router.post("/{goal_id}/contribute", response_model=GoalResponse)
async def contribute_to_goal(
    goal_id: int,
    amount: float = Query(..., gt=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Contribuir para uma meta
    """
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == current_user.id)
        .first()
    )
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )
    
    if goal.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Meta já foi concluída",
        )
    
    # Atualizar progresso
    goal.update_progress(amount)
    
    db.commit()
    db.refresh(goal)
    
    goal.progress_percentage = goal.progress_percentage
    goal.remaining_amount = goal.remaining_amount
    
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Excluir meta
    """
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == current_user.id)
        .first()
    )
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )
    
    db.delete(goal)
    db.commit()
    
    return None
