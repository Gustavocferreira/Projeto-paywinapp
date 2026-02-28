"""
Database Configuration
Setup do SQLAlchemy com suporte a PgBouncer
"""

import os
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://paywinuser:paywinpass_dev_only@localhost:6432/paywinapp"
)

# Engine configuration
# IMPORTANTE: NullPool para PgBouncer (não criar pool local)
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # PgBouncer já gerencia o pool
    echo=os.getenv("ENVIRONMENT") == "development",
    future=True,
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency para FastAPI
    Fornece uma sessão do DB e garante fechamento
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Inicializa o banco de dados
    Cria todas as tabelas se não existirem
    """
    from app.models import Base
    Base.metadata.create_all(bind=engine)


def check_db_connection() -> bool:
    """
    Verifica se a conexão com o banco está funcionando
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
