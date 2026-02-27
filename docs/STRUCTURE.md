# Estrutura de Diretórios - PayWinApp

```
Projeto-paywinapp/
│
├── 📄 README.md                          # Documentação principal
├── 📄 docker-compose.yml                 # Orquestração de serviços
├── 📄 .gitignore                         # Arquivos ignorados pelo Git
├── 📄 Documentacao_Paywinapp.md         # Especificação original
│
├── 📁 .devcontainer/                     # VS Code Dev Containers
│   ├── devcontainer.json                 # Configuração do container
│   ├── post-create.sh                    # Script pós-criação
│   └── post-start.sh                     # Script pós-inicialização
│
├── 📁 services/                          # Microsserviços backend
│   │
│   ├── 📁 python-api/                   # FastAPI + SQLAlchemy
│   │   ├── 📁 app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py                  # Aplicação FastAPI
│   │   │   ├── models.py                # Models SQLAlchemy
│   │   │   ├── schemas.py               # Schemas Pydantic
│   │   │   ├── database.py              # Config de DB
│   │   │   ├── auth.py                  # Utilitários JWT
│   │   │   └── 📁 routers/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py              # Autenticação
│   │   │       ├── users.py             # Usuários
│   │   │       ├── transactions.py      # Transações
│   │   │       ├── goals.py             # Metas
│   │   │       ├── chat.py              # Chat IA
│   │   │       ├── dashboard.py         # Dashboard
│   │   │       └── lgpd.py              # LGPD compliance
│   │   │
│   │   ├── 📁 alembic/                  # Migrações de banco
│   │   │   ├── env.py
│   │   │   └── 📁 versions/
│   │   │       └── 001_initial.py
│   │   │
│   │   ├── alembic.ini                  # Config Alembic
│   │   ├── requirements.txt             # Dependências Python
│   │   ├── Dockerfile                   # Imagem Docker
│   │   └── .env.example                 # Env vars exemplo
│   │
│   └── 📁 go-api/                       # Go High Performance
│       ├── 📁 cmd/
│       │   └── 📁 server/
│       │       └── main.go              # Entry point
│       │
│       ├── 📁 internal/
│       │   ├── 📁 database/
│       │   │   └── pool.go              # Connection pool
│       │   ├── 📁 models/
│       │   │   └── transaction.go       # Structs
│       │   └── 📁 handlers/
│       │       └── transaction.go       # HTTP handlers
│       │
│       ├── go.mod                       # Go modules
│       ├── go.sum                       # Dependencies lock
│       ├── Dockerfile                   # Imagem Docker
│       └── .env.example                 # Env vars exemplo
│
├── 📁 frontend/                          # Next.js App
│   ├── 📁 src/
│   │   ├── 📁 app/                      # App Router (Next.js 14)
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── page.tsx                 # Home page
│   │   │   ├── globals.css              # Global styles
│   │   │   ├── 📁 auth/
│   │   │   ├── 📁 dashboard/
│   │   │   ├── 📁 transactions/
│   │   │   ├── 📁 goals/
│   │   │   └── 📁 chat/
│   │   │
│   │   ├── 📁 components/               # Componentes React
│   │   │   ├── 📁 ui/                   # Componentes básicos
│   │   │   ├── 📁 forms/
│   │   │   ├── 📁 charts/
│   │   │   └── 📁 layout/
│   │   │
│   │   ├── 📁 lib/                      # Utilitários
│   │   │   ├── api.ts                   # Axios clients
│   │   │   ├── utils.ts
│   │   │   └── hooks.ts
│   │   │
│   │   └── 📁 types/                    # TypeScript types
│   │       └── index.ts
│   │
│   ├── 📁 public/                       # Assets estáticos
│   │   ├── favicon.ico
│   │   └── 📁 images/
│   │
│   ├── package.json                     # NPM dependencies
│   ├── tsconfig.json                    # TypeScript config
│   ├── next.config.js                   # Next.js config
│   ├── tailwind.config.js               # Tailwind config
│   ├── postcss.config.js                # PostCSS config
│   ├── .eslintrc.js                     # ESLint config
│   ├── .prettierrc.js                   # Prettier config
│   ├── Dockerfile                       # Imagem Docker
│   └── .env.example                     # Env vars exemplo
│
├── 📁 db/                                # Database configs
│   └── 📁 init/
│       └── 01-init.sql                  # Script de inicialização
│
└── 📁 docs/                              # Documentação técnica
    ├── ARCHITECTURE.md                  # Arquitetura detalhada
    ├── ACCESSIBILITY.md                 # Guia de acessibilidade
    ├── LGPD.md                          # Conformidade LGPD
    ├── API.md                           # Referência de APIs
    ├── DEVELOPMENT.md                   # Guia de desenvolvimento
    └── ROADMAP.md                       # Roadmap das sprints
```

## Estatísticas do Projeto

```
📊 Arquivos criados:        70+
📊 Linhas de código:         ~5,000
📊 Linguagens:              4 (TypeScript, Python, Go, SQL)
📊 Frameworks:              3 (Next.js, FastAPI, Chi)
📊 Microsserviços:          3 (Frontend, Python API, Go API)
📊 Documentação:            6 arquivos principais
```

## Stack Tecnológica

### Frontend
- ⚛️  Next.js 14
- 🔷 TypeScript
- 🎨 Tailwind CSS
- 📊 Recharts
- 🔒 React Hook Form + Zod

### Backend Python
- ⚡ FastAPI
- 🗄️  SQLAlchemy 2.0
- 🔐 JWT (python-jose)
- 🔑 Bcrypt
- 🔄 Alembic

### Backend Go
- 🚀 Go 1.22
- 🌐 Chi Router
- 💾 pgx v5
- ⚡ High Performance

### Infrastructure
- 🐘 PostgreSQL 16
- 🔌 PgBouncer
- 🐳 Docker & Docker Compose
- 📦 Dev Containers

## Próximos Passos

1. ✅ **Estrutura completa criada**
2. ⏳ **Executar**: `docker-compose up`
3. ⏳ **Validar**: Health checks de todos os serviços
4. ⏳ **Implementar**: Autenticação completa
5. ⏳ **Desenvolver**: Features do Sprint 2
