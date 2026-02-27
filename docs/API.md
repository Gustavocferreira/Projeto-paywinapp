# API Reference - PayWinApp

## Base URLs

- **Python API**: `http://localhost:8000`
- **Go API**: `http://localhost:8080`

## Autenticação

Todos os endpoints (exceto auth) requerem autenticação via JWT Bearer token.

```http
Authorization: Bearer <access_token>
```

---

## Python API Endpoints

### Authentication

#### POST /api/v1/auth/register
Registrar novo usuário.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "data_consent_given": true
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "is_active": true,
  "is_verified": false,
  "data_consent_given": true,
  "created_at": "2026-02-27T10:00:00Z"
}
```

#### POST /api/v1/auth/login
Login com credenciais.

**Request:**
```http
Content-Type: application/x-www-form-urlencoded

username=joao@example.com&password=senha123
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

### Users

#### GET /api/v1/users/me
Obter dados do usuário autenticado.

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "data_consent_given": true,
  "created_at": "2026-02-27T10:00:00Z"
}
```

---

### Transactions

#### POST /api/v1/transactions
Criar nova transação.

**Request:**
```json
{
  "amount": 150.00,
  "type": "expense",
  "description": "Supermercado",
  "category_id": 1,
  "occurred_at": "2026-02-27T14:30:00Z",
  "source": "manual"
}
```

**Response:** `201 Created`

#### GET /api/v1/transactions
Listar transações com filtros.

**Query Params:**
- `page` (int): Página (default: 1)
- `page_size` (int): Itens por página (default: 20, max: 100)
- `type` (string): "income" ou "expense"
- `category_id` (int): Filtrar por categoria
- `start_date` (ISO datetime): Data inicial
- `end_date` (ISO datetime): Data final

**Response:** `200 OK`
```json
{
  "transactions": [...],
  "total": 45,
  "page": 1,
  "page_size": 20
}
```

#### PATCH /api/v1/transactions/{id}
Atualizar transação.

#### DELETE /api/v1/transactions/{id}
Excluir transação.

---

### Goals

#### POST /api/v1/goals
Criar meta financeira.

**Request:**
```json
{
  "name": "Viagem para Paris",
  "description": "Economizar para viagem em 2027",
  "target_amount": 10000.00,
  "due_date": "2027-06-01T00:00:00Z"
}
```

#### GET /api/v1/goals
Listar metas.

**Query Params:**
- `is_completed` (bool): Filtrar por status

#### POST /api/v1/goals/{id}/contribute
Adicionar progresso à meta.

**Query Params:**
- `amount` (float): Valor a adicionar

---

### Chat

#### POST /api/v1/chat/message
Enviar mensagem ao Agente Financeiro.

**Request:**
```json
{
  "content": "Gastei R$ 80 em um jantar ontem",
  "session_id": "uuid-opcional"
}
```

**Response:** `201 Created`
```json
{
  "id": 123,
  "role": "agent",
  "content": "Entendi! Você registrou um gasto...",
  "session_id": "abc-123",
  "created_at": "2026-02-27T15:00:00Z"
}
```

---

### Dashboard

#### GET /api/v1/dashboard
Obter dados completos do dashboard.

**Query Params:**
- `period_days` (int): Período em dias (default: 30)

**Response:** `200 OK`
```json
{
  "summary": {
    "total_income": 5000.00,
    "total_expense": 3200.00,
    "balance": 1800.00,
    "savings": 1800.00,
    "period_start": "2026-01-27T00:00:00Z",
    "period_end": "2026-02-27T00:00:00Z"
  },
  "expenses_by_category": [
    {
      "category_id": 1,
      "category_name": "Alimentação",
      "total": 1200.00,
      "percentage": 37.5
    }
  ],
  "recent_transactions": [...],
  "active_goals": [...]
}
```

---

### LGPD

#### GET /api/v1/lgpd/export
Exportar todos os dados do usuário.

**Response:** `200 OK` (JSON file download)

#### POST /api/v1/lgpd/delete-account
Excluir conta permanentemente.

**Request:**
```json
{
  "confirm": true,
  "reason": "Não uso mais o app"
}
```

**Query Params:**
- `password` (string): Senha para confirmação

---

## Go API Endpoints

### High Performance Routes

#### GET /api/v1/highload/transactions/summary
Resumo otimizado de transações.

**Query Params:**
- `user_id` (int): ID do usuário
- `period_days` (int): Período (default: 30)

**Response:** `200 OK`
```json
{
  "total_income": 5000.00,
  "total_expense": 3200.00,
  "balance": 1800.00,
  "savings": 1800.00,
  "period_start": "2026-01-27T00:00:00Z",
  "period_end": "2026-02-27T00:00:00Z",
  "user_id": 1
}
```

#### POST /api/v1/highload/transactions/bulk
Criar múltiplas transações (max: 1000).

**Request:**
```json
{
  "user_id": 1,
  "transactions": [
    {
      "amount": 50.00,
      "type": "expense",
      "description": "Café",
      "occurred_at": "2026-02-27T08:00:00Z",
      "source": "import"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": 98,
  "failed": 2,
  "total_received": 100,
  "errors": ["transaction 5: invalid amount"]
}
```

#### GET /api/v1/highload/reports/monthly
Relatório mensal otimizado.

**Query Params:**
- `user_id` (int): ID do usuário
- `months` (int): Número de meses (default: 12, max: 24)

**Response:** `200 OK`
```json
[
  {
    "month": "2026-02",
    "total_income": 5000.00,
    "total_expense": 3200.00,
    "balance": 1800.00,
    "transaction_count": 45
  }
]
```

---

## Status Codes

- `200` OK - Sucesso
- `201` Created - Recurso criado
- `204` No Content - Sucesso sem retorno
- `400` Bad Request - Dados inválidos
- `401` Unauthorized - Não autenticado
- `403` Forbidden - Sem permissão
- `404` Not Found - Recurso não encontrado
- `422` Unprocessable Entity - Validação falhou
- `500` Internal Server Error - Erro do servidor

## Error Response Format

```json
{
  "error": "Bad Request",
  "message": "Valor deve ser maior que zero",
  "details": {
    "field": "amount",
    "value": -10
  }
}
```
