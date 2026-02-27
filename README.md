# PayWinApp - Finanças Pessoais com IA

## 📋 Visão Geral

PayWinApp é um aplicativo de finanças pessoais com foco em iniciantes, que utiliza um Agente Financeiro conversacional para ajudar usuários a organizarem suas finanças de forma intuitiva.

### 🎯 Diferenciais
- **Agente Financeiro Conversacional**: Registre gastos em linguagem natural
- **Arquitetura Poliglota**: Next.js + Python + Go
- **Acessibilidade First**: WCAG 2.1 AA compliant
- **LGPD Compliant**: Gestão transparente de dados pessoais

## 🏗️ Arquitetura

```
┌─────────────┐
│  Next.js    │◄─── Frontend (TypeScript)
│  Frontend   │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│   Python    │ │    Go    │ │  PgBouncer  │
│  FastAPI    │ │  Service │ │             │
└──────┬──────┘ └────┬─────┘ └──────┬──────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
              ┌───────▼────────┐
              │   PostgreSQL   │
              └────────────────┘
```

### Componentes

1. **Frontend (Next.js + TypeScript)**
   - Interface responsiva e acessível
   - Chat com Agente Financeiro
   - Dashboard, Metas e Transações

2. **Backend Python (FastAPI + SQLAlchemy)**
   - API REST principal
   - Lógica de negócio
   - Inteligência de dados
   - Admin panel

3. **Serviço Go**
   - Rotas de alta performance
   - Processamento de grandes volumes
   - Agregações e relatórios pesados

4. **PostgreSQL + PgBouncer**
   - Banco de dados principal
   - Connection pooling compartilhado

## 🚀 Quick Start

### Pré-requisitos
- Docker & Docker Compose
- VS Code (recomendado para Dev Containers)

### Executar com Docker Compose

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Acessar
- Frontend: http://localhost:3000
- API Python: http://localhost:8000
- API Go: http://localhost:8080
- PostgreSQL: localhost:5432 (via PgBouncer: 6432)
```

### Executar com Dev Containers (Recomendado)

1. Abra o projeto no VS Code
2. Instale a extensão "Dev Containers"
3. Pressione `F1` → "Dev Containers: Reopen in Container"
4. Aguarde a construção do ambiente

## 📁 Estrutura do Projeto

```
Projeto-paywinapp/
├── .devcontainer/          # Configuração Dev Containers
├── frontend/               # Next.js App
├── services/
│   ├── python-api/        # FastAPI + SQLAlchemy
│   └── go-api/            # Go Service
├── db/                     # Database configs e seeds
├── docs/                   # Documentação adicional
└── docker-compose.yml
```

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend Python**: FastAPI, SQLAlchemy, Alembic, Pydantic
- **Backend Go**: Chi Router, database/sql, pgx
- **Database**: PostgreSQL 16, PgBouncer
- **DevOps**: Docker, Docker Compose, Dev Containers

## 📚 Documentação

- [Arquitetura Detalhada](docs/ARCHITECTURE.md)
- [Guia de Desenvolvimento](docs/DEVELOPMENT.md)
- [Acessibilidade](docs/ACCESSIBILITY.md)
- [LGPD Compliance](docs/LGPD.md)
- [API Reference](docs/API.md)

## 🗺️ Roadmap

### Sprint 1: Fundação (2 semanas)
- ✅ Estrutura do projeto
- ✅ Modelagem de dados
- ✅ Docker & Dev Containers
- 🔲 Autenticação básica

### Sprint 2: Core Features (3 semanas)
- 🔲 CRUD de transações
- 🔲 CRUD de metas
- 🔲 Dashboard básico

### Sprint 3: Agente IA (3 semanas)
- 🔲 Integração LLM
- 🔲 Chat UI
- 🔲 Interpretação de linguagem natural

### Sprint 4: Polish & Deploy (2 semanas)
- 🔲 Acessibilidade final
- 🔲 Performance otimization
- 🔲 Deploy production

## 🤝 Contribuindo

Este é um projeto educacional. Contribuições são bem-vindas!

## 📄 Licença

MIT License - veja LICENSE para detalhes.
