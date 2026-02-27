"""
Chat Router
Interface com Agente Financeiro conversacional
"""

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import ChatMessage, MessageRole, User
from app.schemas import ChatMessageCreate, ChatMessageResponse, ChatSessionResponse

router = APIRouter()


@router.post("/message", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Enviar mensagem para o Agente Financeiro
    Retorna resposta do agente
    """
    # Gerar session_id se não fornecido
    session_id = message_data.session_id or str(uuid.uuid4())
    
    # Salvar mensagem do usuário
    user_message = ChatMessage(
        user_id=current_user.id,
        role=MessageRole.USER,
        content=message_data.content,
        session_id=session_id,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # IMPORTANTE: Aqui deve integrar com serviço de IA
    # Por enquanto, resposta placeholder
    agent_response = process_agent_response(message_data.content, current_user, db)
    
    # Salvar resposta do agente
    agent_message = ChatMessage(
        user_id=current_user.id,
        role=MessageRole.AGENT,
        content=agent_response,
        session_id=session_id,
    )
    db.add(agent_message)
    db.commit()
    db.refresh(agent_message)
    
    return agent_message


@router.get("/sessions", response_model=List[str])
async def list_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar IDs de sessões de chat do usuário
    """
    sessions = (
        db.query(ChatMessage.session_id)
        .filter(ChatMessage.user_id == current_user.id)
        .distinct()
        .all()
    )
    
    return [s[0] for s in sessions if s[0]]


@router.get("/session/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter histórico de uma sessão de chat
    """
    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada",
        )
    
    return {
        "session_id": session_id,
        "messages": messages,
    }


@router.get("/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
):
    """
    Obter histórico recente de todas as conversas
    """
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    
    return messages


def process_agent_response(user_message: str, user: User, db: Session) -> str:
    """
    Processar mensagem e gerar resposta do agente
    
    TODO: Integrar com LLM (Gemini, OpenAI, etc.)
    Por enquanto, lógica simples baseada em palavras-chave
    """
    message_lower = user_message.lower()
    
    # Detecção simples de intenções
    if any(word in message_lower for word in ["gastei", "gasto", "gastou", "paguei"]):
        return (
            "Entendi! Você registrou um gasto. "
            "Quer que eu adicione isso às suas transações? "
            "Por favor, me informe: valor, categoria e data (se não for hoje)."
        )
    
    elif any(word in message_lower for word in ["meta", "objetivo", "economizar", "guardar"]):
        return (
            "Que ótimo que você quer criar uma meta de economia! "
            "Me conte: qual o valor que deseja economizar e até quando?"
        )
    
    elif any(word in message_lower for word in ["quanto", "saldo", "total"]):
        return (
            "Para ver seu saldo e resumo financeiro, "
            "acesse a tela de Dashboard ou me pergunte algo mais específico!"
        )
    
    else:
        return (
            "Olá! Sou seu Agente Financeiro. 😊\n\n"
            "Posso ajudar você a:\n"
            "• Registrar gastos e receitas\n"
            "• Criar e acompanhar metas de economia\n"
            "• Ver resumos e relatórios\n\n"
            "Como posso ajudar hoje?"
        )
