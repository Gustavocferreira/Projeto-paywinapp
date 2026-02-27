"""
LGPD Router
Endpoints para conformidade com LGPD
Direito ao esquecimento, portabilidade de dados, etc.
"""

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.auth import get_current_active_user, get_password_hash, verify_password
from app.database import get_db
from app.models import ChatMessage, Goal, Transaction, User
from app.schemas import ConsentUpdate, DataDeletionRequest, DataExportRequest

router = APIRouter()


@router.get("/export", response_class=JSONResponse)
async def export_user_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    format: str = "json",
):
    """
    Exportar todos os dados do usuário (Portabilidade - Art. 18, LGPD)
    Formato JSON estruturado
    """
    # Coletar todos os dados do usuário
    user_data = {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "data_consent_given": current_user.data_consent_given,
            "data_consent_date": current_user.data_consent_date.isoformat() if current_user.data_consent_date else None,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "created_at": current_user.created_at.isoformat(),
            "updated_at": current_user.updated_at.isoformat(),
        },
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "type": t.type.value,
                "description": t.description,
                "occurred_at": t.occurred_at.isoformat(),
                "source": t.source,
                "created_at": t.created_at.isoformat(),
            }
            for t in current_user.transactions
        ],
        "goals": [
            {
                "id": g.id,
                "name": g.name,
                "description": g.description,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "due_date": g.due_date.isoformat() if g.due_date else None,
                "is_completed": g.is_completed,
                "completed_at": g.completed_at.isoformat() if g.completed_at else None,
                "created_at": g.created_at.isoformat(),
            }
            for g in current_user.goals
        ],
        "chat_messages": [
            {
                "id": m.id,
                "role": m.role.value,
                "content": m.content,
                "session_id": m.session_id,
                "created_at": m.created_at.isoformat(),
            }
            for m in current_user.chat_messages
        ],
        "export_date": datetime.utcnow().isoformat(),
        "export_format": "json",
    }
    
    # Retornar JSON formatado
    return JSONResponse(
        content=user_data,
        headers={
            "Content-Disposition": f'attachment; filename="paywinapp_data_{current_user.id}.json"'
        }
    )


@router.post("/delete-account", status_code=status.HTTP_200_OK)
async def request_account_deletion(
    deletion_request: DataDeletionRequest,
    password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Solicitar exclusão completa da conta e dados (Direito ao Esquecimento - Art. 18, LGPD)
    
    IMPORTANTE: Este endpoint executa exclusão permanente!
    - Exclui todas as transações
    - Exclui todas as metas
    - Exclui histórico de chat
    - Exclui conta do usuário
    
    Requer confirmação explícita e senha
    """
    # Validar senha
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta",
        )
    
    # Validar confirmação
    if not deletion_request.confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="É necessário confirmar a exclusão",
        )
    
    # Registrar motivo (audit log - pode ser salvo em arquivo separado)
    deletion_reason = deletion_request.reason or "Não informado"
    print(f"[LGPD] Account deletion requested - User ID: {current_user.id}, Reason: {deletion_reason}")
    
    # Executar exclusão em cascata (já configurado nos models)
    # As transações, metas e mensagens serão excluídas automaticamente
    db.delete(current_user)
    db.commit()
    
    return {
        "message": "Conta e todos os dados foram excluídos permanentemente",
        "deleted_at": datetime.utcnow().isoformat(),
        "user_id": current_user.id,
    }


@router.patch("/consent", status_code=status.HTTP_200_OK)
async def update_data_consent(
    consent_update: ConsentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Atualizar consentimento de uso de dados
    Permite revogar ou conceder consentimento conforme LGPD
    """
    current_user.data_consent_given = consent_update.data_consent_given
    
    if consent_update.data_consent_given:
        current_user.data_consent_date = datetime.utcnow()
    else:
        # Se revogar consentimento, pode desativar conta
        # (Política da aplicação - adaptar conforme necessidade)
        current_user.is_active = False
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Consentimento atualizado com sucesso",
        "data_consent_given": current_user.data_consent_given,
        "consent_date": current_user.data_consent_date.isoformat() if current_user.data_consent_date else None,
        "is_active": current_user.is_active,
    }


@router.get("/data-summary")
async def get_data_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Resumo de dados armazenados sobre o usuário
    Transparência conforme LGPD
    """
    transactions_count = db.query(Transaction).filter(Transaction.user_id == current_user.id).count()
    goals_count = db.query(Goal).filter(Goal.user_id == current_user.id).count()
    messages_count = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).count()
    
    return {
        "user_info": {
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat(),
            "data_consent_given": current_user.data_consent_given,
            "consent_date": current_user.data_consent_date.isoformat() if current_user.data_consent_date else None,
        },
        "data_stored": {
            "transactions_count": transactions_count,
            "goals_count": goals_count,
            "chat_messages_count": messages_count,
        },
        "data_usage": {
            "purpose": "Gerenciamento de finanças pessoais",
            "retention_policy": "Dados mantidos enquanto a conta estiver ativa",
            "sharing": "Dados não são compartilhados com terceiros",
        },
        "your_rights": {
            "access": "Você pode exportar todos os seus dados a qualquer momento",
            "rectification": "Você pode atualizar suas informações pessoais",
            "deletion": "Você pode solicitar a exclusão completa de sua conta e dados",
            "portability": "Você pode exportar seus dados em formato JSON",
            "consent_revocation": "Você pode revogar o consentimento a qualquer momento",
        }
    }
