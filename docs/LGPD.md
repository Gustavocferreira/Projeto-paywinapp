# LGPD Compliance - PayWinApp

## Introdução

Este documento descreve como o PayWinApp está em conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**, garantindo a privacidade e proteção dos dados pessoais dos usuários.

## Princípios Aplicados

### 1. Finalidade
**Artigo 6º, I - LGPD**

Dados coletados apenas para propósitos legítimos, específicos e informados ao titular.

**Implementação:**
- Coleta apenas de dados essenciais (nome, email, dados financeiros)
- Finalidade clara: gerenciamento de finanças pessoais
- Não compartilhamento com terceiros
- Sem uso para fins diferentes do informado

### 2. Adequação
**Artigo 6º, II - LGPD**

Compatibilidade do tratamento com as finalidades informadas.

**Implementação:**
- Dados financeiros usados apenas para dashboard/relatórios
- Email usado apenas para autenticação e comunicações essenciais
- Sem venda ou compartilhamento de dados

### 3. Necessidade
**Artigo 6º, III - LGPD**

Limitação ao mínimo necessário para realização das finalidades.

**Implementação:**
```typescript
// Apenas dados essenciais coletados
interface UserRegistration {
  name: string;        // Necessário para personalização
  email: string;       // Necessário para autenticação
  password: string;    // Necessário para segurança
}

// NÃO coletamos:
// - CPF/RG
// - Endereço completo
// - Telefone (a menos que usuário forneça)
// - Dados bancários reais
```

### 4. Transparência
**Artigo 6º, VI - LGPD**

Garantia de informações claras e acessíveis sobre o tratamento.

**Implementação no Código:**
```python
# API Endpoint: GET /api/v1/lgpd/data-summary
@router.get("/data-summary")
async def get_data_summary(current_user: User = Depends(get_current_active_user)):
    """
    Transparência total: usuário vê exatamente quais dados temos
    """
    return {
        "user_info": {...},
        "data_stored": {
            "transactions_count": N,
            "goals_count": N,
            "chat_messages_count": N,
        },
        "data_usage": {
            "purpose": "Gerenciamento de finanças pessoais",
            "retention_policy": "Dados mantidos enquanto conta estiver ativa",
            "sharing": "Dados não são compartilhados com terceiros",
        },
        "your_rights": {...}
    }
```

### 5. Segurança
**Artigo 6º, VII - LGPD**

Utilização de medidas técnicas e administrativas.

**Implementação:**
- **Senhas**: Bcrypt hashing (impossible to reverse)
- **Tokens**: JWT com expiração de 30 minutos
- **HTTPS**: Obrigatório em produção
- **Logs**: Sem dados sensíveis
- **Database**: Isolamento lógico por usuário

```python
# Senha NUNCA armazenada em texto plano
hashed_password = get_password_hash(password)  # Bcrypt

# Logs SEM dados sensíveis
logger.info(f"User login attempt: {email}")  # ✓ OK
logger.info(f"Password: {password}")         # ✗ NUNCA FAZER
```

### 6. Prevenção
**Artigo 6º, VIII - LGPD**

Adoção de medidas para prevenir danos.

**Implementação:**
```python
# Input validation
class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)  # Previne valores negativos inválidos
    type: str = Field(..., pattern="^(income|expense)$")  # Apenas valores válidos
    
# SQL Injection prevention
# SQLAlchemy ORM com parametrização automática
# NUNCA concatenar strings SQL

# XSS Prevention
# React escapa automaticamente
# Headers de segurança no Next.js config
```

## Direitos dos Titulares (Art. 18)

### 1. Confirmação e Acesso
**Artigo 18, I e II**

Usuário pode confirmar e acessar seus dados.

**Implementação:**
```python
# GET /api/v1/users/me
# Retorna todos os dados do usuário

# GET /api/v1/lgpd/data-summary
# Resumo detalhado de todos os dados armazenados
```

### 2. Correção
**Artigo 18, III**

Usuário pode corrigir dados incompletos, inexatos ou desatualizados.

**Implementação:**
```python
# PATCH /api/v1/users/me
# Permite atualização de nome e email

# PATCH /api/v1/transactions/{id}
# Permite correção de transações

# PATCH /api/v1/goals/{id}
# Permite atualização de metas
```

### 3. Anonimização, Bloqueio ou Eliminação
**Artigo 18, IV**

**Implementação de Exclusão Completa:**
```python
@router.post("/delete-account")
async def request_account_deletion(
    deletion_request: DataDeletionRequest,
    password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Direito ao Esquecimento (Right to be Forgotten)
    
    IMPLEMENTAÇÃO:
    1. Validar senha (segurança)
    2. Validar confirmação explícita
    3. Registrar motivo (audit log)
    4. Deletar TODOS os dados:
       - Transações (cascade)
       - Metas (cascade)
       - Mensagens de chat (cascade)
       - Conta do usuário
    """
    
    # Validações
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Senha incorreta")
    
    if not deletion_request.confirm:
        raise HTTPException(status_code=400, detail="Confirmação necessária")
    
    # Audit log
    logger.info(f"Account deletion: user_id={current_user.id}, reason={deletion_request.reason}")
    
    # Exclusão em cascata (configurado nos models)
    db.delete(current_user)
    db.commit()
    
    return {"message": "Conta e dados excluídos permanentemente"}
```

**Models com Cascade Delete:**
```python
class User(Base):
    # Relacionamentos com cascade delete
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
```

### 4. Portabilidade
**Artigo 18, V**

Porta bilidade dos dados a outro fornecedor.

**Implementação:**
```python
@router.get("/export")
async def export_user_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Exportação completa de dados em JSON
    Formato estruturado e legível por máquina
    """
    user_data = {
        "user": {...},
        "transactions": [...],
        "goals": [...],
        "chat_messages": [...],
        "export_date": datetime.utcnow().isoformat(),
    }
    
    return JSONResponse(
        content=user_data,
        headers={
            "Content-Disposition": f'attachment; filename="paywinapp_data_{user_id}.json"'
        }
    )
```

### 5. Informação sobre Compartilhamento
**Artigo 18, VII**

**Implementação:**
```python
# Resposta do endpoint /lgpd/data-summary
{
    "data_usage": {
        "sharing": "Dados NÃO são compartilhados com terceiros",
        "third_parties": [],  # Lista vazia
        "purpose": "Uso exclusivo para funcionalidades do app"
    }
}
```

### 6. Revogação do Consentimento
**Artigo 18, IX**

**Implementação:**
```python
@router.patch("/consent")
async def update_data_consent(
    consent_update: ConsentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Permite revogar consentimento
    Ao revogar, conta é desativada (política do app)
    """
    current_user.data_consent_given = consent_update.data_consent_given
    
    if not consent_update.data_consent_given:
        current_user.is_active = False  # Desativa conta se consentimento revogado
    
    db.commit()
    
    return {"message": "Consentimento atualizado"}
```

## Consentimento Explícito

### Na Criação da Conta
```python
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    data_consent_given: bool  # Obrigatório e explícito

@router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if not user_data.data_consent_given:
        raise HTTPException(
            status_code=400,
            detail="É necessário consentir com o uso de dados pessoais"
        )
    # ...
```

### Interface (Frontend)
```tsx
<form onSubmit={handleRegister}>
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  
  <label>
    <input
      type="checkbox"
      name="consent"
      required
      aria-required="true"
    />
    <span>
      Li e concordo com a{' '}
      <a href="/privacy">Política de Privacidade</a> e
      autorizo o tratamento dos meus dados pessoais
      conforme descrito.
    </span>
  </label>
  
  <button type="submit">Criar Conta</button>
</form>
```

## Retenção de Dados

### Política
```python
"""
POLÍTICA DE RETENÇÃO:
- Dados mantidos enquanto a conta estiver ativa
- Após desativação: 30 dias para recuperação
- Após 30 dias: exclusão automática permanente
- Logs de auditoria: 1 ano (sem dados pessoais)
"""

# Implementação futura: Job de limpeza
async def cleanup_inactive_accounts():
    """
    Executa diariamente
    Exclui contas inativas há mais de 30 dias
    """
    cutoff_date = datetime.utcnow() - timedelta(days=30)
    
    inactive_users = db.query(User).filter(
        User.is_active == False,
        User.updated_at < cutoff_date
    ).all()
    
    for user in inactive_users:
        logger.info(f"Auto-delete inactive account: {user.id}")
        db.delete(user)
    
    db.commit()
```

## Segurança dos Dados

### Criptografia
```python
# Em trânsito: HTTPS obrigatório
# Em repouso: PostgreSQL com encryption at rest (produção)

# Senhas: Bcrypt (irreversível)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Tokens: JWT com expiração
jwt.encode(payload, SECRET_KEY, algorithm="HS256")
```

### Logs Seguros
```python
# ✓ Correto - Sem dados sensíveis
logger.info(f"User {user_id} created transaction")

# ✗ ERRADO - Expõe dados sensíveis
logger.info(f"User {email} with password {password} logged in")

# ✗ ERRADO - Expõe valores financeiros em log
logger.info(f"Transaction: {amount}, {description}")
```

### Isolamento de Dados
```python
# Todas as queries filtradas por user_id
transactions = db.query(Transaction).filter(
    Transaction.user_id == current_user.id  # Sempre filtrar!
).all()

# Middleware global garante user_id do token
# Impossível acessar dados de outro usuário
```

## Checklist de Conformidade

- [x] **Consentimento explícito** no cadastro
- [x] **Política de Privacidade** acessível
- [x] **Finalidade clara** do tratamento
- [x] **Minimização de dados** (só o essencial)
- [x] **Acesso aos dados** (GET /users/me, /lgpd/data-summary)
- [x] **Correção de dados** (PATCH endpoints)
- [x] **Exportação de dados** (GET /lgpd/export)
- [x] **Exclusão de dados** (POST /lgpd/delete-account)
- [x] **Revogação de consentimento** (PATCH /lgpd/consent)
- [x] **Transparência** (documentação completa)
- [x] **Segurança** (HTTPS, bcrypt, JWT, validação)
- [x] **Logs sem dados sensíveis**
- [ ] **DPO designado** (para produção)
- [ ] **Relatório de Impacto** (RIPD - se necessário)
- [ ] **Política de retenção** (implementar job de limpeza)
- [ ] **Notificação de incidentes** (em caso de vazamento)

## Contato DPO (Produção)

```
Email: dpo@paywinapp.com
Formulário: https://paywinapp.com/lgpd/contact
Tempo de resposta: 15 dias úteis
```

## Referências

- [Lei 13.709/2018 - LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)
- [ANPD - Autoridade Nacional](https://www.gov.br/anpd/)
- [Guia de Boas Práticas](https://www.gov.br/anpd/pt-br/assuntos/noticias)
