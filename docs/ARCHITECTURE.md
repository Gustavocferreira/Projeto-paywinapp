# Arquitetura do PayWinApp

## Visão Geral

PayWinApp é uma aplicação de finanças pessoais com arquitetura poliglota, combinando o melhor de cada linguagem para diferentes necessidades.

```
┌─────────────────────────────────────────────────┐
│            Frontend (Next.js/TypeScript)        │
│  • Interface Responsiva e Acessível (WCAG 2.1) │
│  • Chat com Agente Financeiro                   │
│  • Dashboard, Metas, Transações                 │
└────────────┬────────────────────────────────────┘
             │
             ├──────────────┬──────────────┐
             │              │              │
┌────────────▼────┐  ┌──────▼──────┐  ┌───▼──────┐
│   Python API    │  │   Go API    │  │PgBouncer │
│   (FastAPI)     │  │ (Performance)│  │  Pool    │
│                 │  │              │  │          │
│ • Auth & CRUD   │  │ • Bulk Ops  │  │          │
│ • Business Logic│  │ • Reports   │  │          │
│ • LGPD          │  │ • Analytics │  │          │
│ • Chat Agent    │  │             │  │          │
└────────────┬────┘  └──────┬──────┘  └───┬──────┘
             │              │              │
             └──────────────┴──────────────┘
                            │
                   ┌────────▼────────┐
                   │   PostgreSQL    │
                   │   Database      │
                   └─────────────────┘
```

## Componentes

### 1. Frontend (Next.js 14 + TypeScript)

**Responsabilidades:**
- Interface do usuário responsiva e acessível
- Chat com Agente Financeiro
- Visualização de dados (gráficos, dashboards)
- Formulários de transações e metas

**Tecnologias:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- React Hook Form + Zod
- Recharts (gráficos)
- Axios (HTTP client)

**Acessibilidade:**
- WCAG 2.1 AA compliant
- Navegação por teclado
- Atributos ARIA
- Skip to main content
- Contraste adequado
- Foco visível

### 2. Backend Python (FastAPI + SQLAlchemy)

**Responsabilidades:**
- API REST principal
- Autenticação e autorização (JWT)
- CRUD de todas as entidades
- Lógica de negócio
- Cálculos financeiros
- Integração com LLM (Agente IA)
- Conformidade LGPD

**Tecnologias:**
- FastAPI
- SQLAlchemy 2.0 + Alembic
- PostgreSQL (via psycopg2)
- Pydantic v2
- JWT (python-jose)
- Bcrypt (passlib)

**Arquitetura:**
```
app/
├── main.py              # FastAPI app
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── database.py          # DB config
├── auth.py              # Auth utilities
└── routers/
    ├── auth.py          # Auth endpoints
    ├── users.py         # User management
    ├── transactions.py  # Transactions CRUD
    ├── goals.py         # Goals CRUD
    ├── chat.py          # Chat with AI Agent
    ├── dashboard.py     # Aggregations
    └── lgpd.py          # LGPD compliance
```

**Princípios:**
- **Sem triggers**: Toda lógica em código Python
- **Isolamento por usuário**: Queries sempre filtradas por user_id
- **Transações explícitas**: Não há cálculos automáticos no BD
- **Logs sem dados sensíveis**: Nunca logar senhas ou tokens

### 3. Backend Go (High Performance)

**Responsabilidades:**
- Endpoints de alta performance
- Operações em lote (bulk)
- Relatórios pesados
- Agregações complexas
- Processamento de grandes volumes

**Tecnologias:**
- Go 1.22
- Chi Router
- pgx v5 (driver PostgreSQL)
- Standard library

**Endpoints:**
- `GET /api/v1/highload/transactions/summary` - Resumo otimizado
- `POST /api/v1/highload/transactions/bulk` - Inserção em lote
- `GET /api/v1/highload/reports/monthly` - Relatório mensal
- `GET /api/v1/highload/reports/category-trends` - Tendências por categoria

**Otimizações:**
- Pool de conexões mínimo (PgBouncer gerencia)
- Queries otimizadas com índices
- Transações batch
- Context timeouts

### 4. PostgreSQL + PgBouncer

**PostgreSQL 16:**
- Banco de dados principal
- Locale pt_BR.UTF-8
- Extensões: uuid-ossp, pg_trgm

**PgBouncer:**
- Connection pooling compartilhado
- Modo: Transaction pooling
- Max connections: 1000 clients
- Default pool size: 25
- Reserve pool: 5

**Configuração de Pools:**
```
Python API → PgBouncer → PostgreSQL
(NullPool)   (Pool:25)   (max:100)

Go API → PgBouncer → PostgreSQL
(MaxConns:10) (Pool:25)  (max:100)
```

**Por que PgBouncer?**
- Compartilhamento eficiente de conexões entre Python e Go
- Reduz overhead de criação de conexões
- Melhora performance em alta concorrência
- Transaction pooling permite reutilização agressiva

## Fluxo de Dados

### 1. Autenticação
```
Client → POST /api/v1/auth/login (Python)
       → JWT token
       → localStorage.setItem('access_token')
       → Headers: Authorization: Bearer <token>
```

### 2. Criar Transação
```
Client → POST /api/v1/transactions (Python)
       → Validate schema (Pydantic)
       → Insert into DB (SQLAlchemy)
       → Return transaction object
```

### 3. Dashboard (Agregações)
```
Client → GET /api/v1/dashboard (Python)
       → Query transactions (SQLAlchemy)
       → Calculate totals IN CODE
       → Group by category IN CODE
       → Return JSON
```

### 4. Bulk Import (Go - High Performance)
```
Client → POST /api/v1/highload/transactions/bulk (Go)
       → Validate 1000 transactions
       → Begin transaction
       → Bulk insert
       → Commit
       → Return result
```

### 5. Chat com Agente IA
```
Client → POST /api/v1/chat/message (Python)
       → Save user message
       → Call AI service (Gemini/OpenAI)
       → Process intent
       → Generate response
       → Save agent message
       → Return response
```

## Segurança

### Autenticação
- JWT tokens (HS256)
- Expiration: 30 minutes
- Stored in localStorage
- Sent in Authorization header

### Passwords
- Bcrypt hashing
- Min length: 8 characters
- Never logged or exposed

### CORS
- Allowed origins: localhost:3000, localhost:3001
- Credentials: true
- Methods: GET, POST, PUT, PATCH, DELETE

### Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

### LGPD Compliance
- Explicit consent on registration
- Data export (JSON)
- Right to be forgotten (complete deletion)
- Consent revocation
- Transparent data usage

## Performance

### Database Indexes
- `users(email)` - Unique index
- `transactions(user_id, occurred_at)` - Composite
- `transactions(user_id, type, occurred_at)` - Composite
- `goals(user_id, is_completed)` - Composite
- `chat_messages(user_id, session_id)` - Composite

### Caching Strategy (Future)
- Redis for session management
- Cache dashboard aggregations
- Invalidate on transaction create/update

### Query Optimization
- Always filter by user_id FIRST
- Use LIMIT for pagination
- Avoid N+1 queries (eager loading)
- Aggregate in database when possible

## Deployment

### Development
```bash
docker-compose up
```

### Production (Future)
- Kubernetes cluster
- Separate namespaces per service
- Horizontal Pod Autoscaler
- Ingress with TLS
- Managed PostgreSQL (RDS, Cloud SQL, etc.)
- Managed Redis

## Monitoramento (Future)

- **Logs**: Structured JSON logs
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Errors**: Sentry
- **Uptime**: UptimeRobot

## Próximos Passos

1. **Sprint 1**: Autenticação + CRUD básico
2. **Sprint 2**: Dashboard + Gráficos
3. **Sprint 3**: Integração LLM + Chat
4. **Sprint 4**: Polish + Deploy
