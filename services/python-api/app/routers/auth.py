"""
Authentication Router
Endpoints de autenticação e autorização
"""

from datetime import datetime, timedelta
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token, 
    get_password_hash, 
    sanitize_input,
    validate_password_strength,
    verify_password
)
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, Token, UserCreate, UserResponse

router = APIRouter()

# Sistema simples de rate limiting (em produção usar Redis)
login_attempts: Dict[str, list] = {}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrar novo usuário
    Requer consentimento LGPD explícito
    """
    # Validar consentimento LGPD
    if not user_data.data_consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="É necessário consentir com o uso de dados pessoais",
        )
    
    # Sanitizar entrada de dados
    name = sanitize_input(user_data.name, max_length=255)
    email = sanitize_input(user_data.email.lower(), max_length=255)
    
    # Validar nome
    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome deve ter pelo menos 2 caracteres",
        )
    
    # Validar formato de email
    import re
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email inválido",
        )
    
    # Verificar se email já existe
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado",
        )
    
    # Validar força da senha
    is_valid, message = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    
    # Criar usuário
    db_user = User(
        name=name,
        email=email,
        hashed_password=get_password_hash(user_data.password),
        data_consent_given=user_data.data_consent_given,
        data_consent_date=datetime.utcnow() if user_data.data_consent_given else None,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login com email e senha
    Retorna JWT token
    Proteção contra força bruta: máximo 5 tentativas em 15 minutos
    """
    # Rate limiting simples (em produção usar Redis)
    client_ip = request.client.host if request.client else "unknown"
    email = form_data.username.lower().strip()
    attempt_key = f"{client_ip}:{email}"
    
    current_time = datetime.utcnow()
    
    # Limpar tentativas antigas (> 15 minutos)
    if attempt_key in login_attempts:
        login_attempts[attempt_key] = [
            t for t in login_attempts[attempt_key]
            if current_time - t < timedelta(minutes=15)
        ]
    
    # Verificar número de tentativas
    if attempt_key in login_attempts and len(login_attempts[attempt_key]) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas de login. Tente novamente em 15 minutos",
        )
    
    # Buscar usuário
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Registrar tentativa falha
        if attempt_key not in login_attempts:
            login_attempts[attempt_key] = []
        login_attempts[attempt_key].append(current_time)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo",
        )
    
    # Login bem-sucedido - limpar tentativas
    if attempt_key in login_attempts:
        del login_attempts[attempt_key]
    
    # Criar token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/json", response_model=Token)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login alternativo com JSON
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo",
        )
    
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
