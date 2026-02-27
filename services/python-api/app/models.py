"""
SQLAlchemy Models - PayWinApp
Modelagem de dados sem triggers, toda lógica em código Python
"""

from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# Enums
class TransactionType(str, PyEnum):
    """Tipos de transação"""
    INCOME = "income"
    EXPENSE = "expense"


class MessageRole(str, PyEnum):
    """Papéis nas mensagens do chat"""
    USER = "user"
    AGENT = "agent"


# Models
class User(Base):
    """
    Modelo de Usuário
    Armazena dados de autenticação e perfil básico
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # LGPD - Consentimento
    data_consent_given = Column(Boolean, default=False, nullable=False)
    data_consent_date = Column(DateTime, nullable=True)
    
    # Controle de conta
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relacionamentos
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"


class Category(Base):
    """
    Categorias de Transações
    Predefinidas e customizáveis pelo usuário
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(Enum(TransactionType), nullable=False, index=True)
    
    # Categoria padrão ou customizada por usuário
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    is_default = Column(Boolean, default=False, nullable=False)
    
    # Ícone e cor (para UI)
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True)  # Hex color #RRGGBB
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id])
    transactions = relationship("Transaction", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', type='{self.type}')>"


class Transaction(Base):
    """
    Transações Financeiras
    IMPORTANTE: Sem triggers - cálculos de totais feitos em código
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Dados da transação
    amount = Column(Float, nullable=False)  # Sempre positivo, tipo define entrada/saída
    type = Column(Enum(TransactionType), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Categoria
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    
    # Data da ocorrência (não necessariamente quando foi registrada)
    occurred_at = Column(DateTime, nullable=False, index=True)
    
    # Origem (manual, chat, importação)
    source = Column(String(50), default="manual", nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relacionamentos
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, type='{self.type}', amount={self.amount})>"

    @property
    def signed_amount(self) -> float:
        """
        Retorna o valor com sinal correto
        Receitas: positivo | Despesas: negativo
        """
        return self.amount if self.type == TransactionType.INCOME else -self.amount


class Goal(Base):
    """
    Metas Financeiras
    Progresso calculado em código (sem triggers)
    """
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Dados da meta
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0, nullable=False)
    
    # Data alvo (opcional)
    due_date = Column(DateTime, nullable=True, index=True)
    
    # Status
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Origem
    source = Column(String(50), default="manual", nullable=False)  # manual, chat
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relacionamentos
    user = relationship("User", back_populates="goals")

    def __repr__(self):
        return f"<Goal(id={self.id}, name='{self.name}', progress={self.progress_percentage}%)>"

    @property
    def progress_percentage(self) -> float:
        """Calcula porcentagem de progresso"""
        if self.target_amount <= 0:
            return 0.0
        return min((self.current_amount / self.target_amount) * 100, 100.0)

    @property
    def remaining_amount(self) -> float:
        """Calcula quanto falta para atingir a meta"""
        return max(self.target_amount - self.current_amount, 0.0)

    def update_progress(self, amount: float) -> None:
        """
        Atualiza o progresso da meta
        IMPORTANTE: Lógica explícita, sem triggers
        """
        self.current_amount += amount
        
        if self.current_amount >= self.target_amount and not self.is_completed:
            self.is_completed = True
            self.completed_at = func.now()


class ChatMessage(Base):
    """
    Mensagens do Chat com Agente Financeiro
    Histórico de conversação para contexto e auditoria
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Conteúdo
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    
    # Metadados opcionais (JSON-like, para flexibilidade)
    # Ex: intent detectado, entidades extraídas, etc.
    metadata = Column(Text, nullable=True)  # JSON string
    
    # Sessão (para agrupar conversas)
    session_id = Column(String(100), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)
    
    # Relacionamentos
    user = relationship("User", back_populates="chat_messages")

    def __repr__(self):
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<ChatMessage(id={self.id}, role='{self.role}', preview='{preview}')>"


# Índices compostos para queries comuns
from sqlalchemy import Index

# Transações por usuário e data
Index('idx_transactions_user_date', Transaction.user_id, Transaction.occurred_at)

# Transações por usuário, tipo e data
Index('idx_transactions_user_type_date', Transaction.user_id, Transaction.type, Transaction.occurred_at)

# Metas ativas por usuário
Index('idx_goals_user_active', Goal.user_id, Goal.is_completed)

# Mensagens por usuário e sessão
Index('idx_chat_user_session', ChatMessage.user_id, ChatMessage.session_id)
