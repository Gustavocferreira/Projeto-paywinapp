"""
Pydantic Schemas para validação e serialização
Separados dos models SQLAlchemy para seguir o padrão do FastAPI
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ===== USER SCHEMAS =====

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    data_consent_given: bool = Field(default=False)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None


class UserInDB(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    data_consent_given: bool
    data_consent_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserResponse(UserInDB):
    """Response público - sem dados sensíveis"""
    pass


# ===== AUTH SCHEMAS =====

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ===== CATEGORY SCHEMAS =====

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., pattern="^(income|expense)$")
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    user_id: Optional[int]
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== TRANSACTION SCHEMAS =====

class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    type: str = Field(..., pattern="^(income|expense)$")
    description: Optional[str] = None
    category_id: Optional[int] = None
    occurred_at: datetime


class TransactionCreate(TransactionBase):
    source: str = Field(default="manual", max_length=50)


class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[str] = Field(None, pattern="^(income|expense)$")
    description: Optional[str] = None
    category_id: Optional[int] = None
    occurred_at: Optional[datetime] = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    source: str
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    page_size: int


# ===== GOAL SCHEMAS =====

class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    target_amount: float = Field(..., gt=0)
    due_date: Optional[datetime] = None


class GoalCreate(GoalBase):
    source: str = Field(default="manual", max_length=50)


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
    due_date: Optional[datetime] = None


class GoalResponse(GoalBase):
    id: int
    user_id: int
    current_amount: float
    is_completed: bool
    completed_at: Optional[datetime]
    source: str
    created_at: datetime
    updated_at: datetime
    progress_percentage: float
    remaining_amount: float

    class Config:
        from_attributes = True


# ===== CHAT SCHEMAS =====

class ChatMessageBase(BaseModel):
    content: str = Field(..., min_length=1)


class ChatMessageCreate(ChatMessageBase):
    session_id: Optional[str] = None


class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    role: str
    extra_data: Optional[str] = None
    session_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    session_id: str
    messages: List[ChatMessageResponse]


# ===== DASHBOARD SCHEMAS =====

class DashboardSummary(BaseModel):
    """Resumo financeiro do dashboard"""
    total_income: float
    total_expense: float
    balance: float
    savings: float
    period_start: datetime
    period_end: datetime


class CategorySummary(BaseModel):
    """Gastos por categoria"""
    category_id: int
    category_name: str
    total: float
    percentage: float


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    expenses_by_category: List[CategorySummary]
    recent_transactions: List[TransactionResponse]
    active_goals: List[GoalResponse]


# ===== LGPD SCHEMAS =====

class DataExportRequest(BaseModel):
    """Solicitar exportação de dados (LGPD)"""
    format: str = Field(default="json", pattern="^(json|csv)$")


class DataDeletionRequest(BaseModel):
    """Solicitar exclusão de conta e dados (LGPD)"""
    confirm: bool = Field(..., description="Confirmação explícita")
    reason: Optional[str] = Field(None, max_length=500)

    @field_validator('confirm')
    @classmethod
    def must_confirm(cls, v: bool) -> bool:
        if not v:
            raise ValueError('É necessário confirmar a exclusão de dados')
        return v


class ConsentUpdate(BaseModel):
    """Atualizar consentimento de uso de dados"""
    data_consent_given: bool
