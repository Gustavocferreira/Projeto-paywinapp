# Guia de Desenvolvimento - PayWinApp

## Setup Inicial

### Pré-requisitos
- Docker Desktop
- VS Code (recomendado)
- Node.js 20+ (se executar localmente)
- Python 3.12+ (se executar localmente)
- Go 1.22+ (se executar localmente)

### Clonar Repositório
```bash
git clone https://github.com/seu-usuario/Projeto-paywinapp.git
cd Projeto-paywinapp
```

---

## Opção 1: Docker Compose (Recomendado)

### Iniciar Todos os Serviços
```bash
# Subir todos os containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Serviços Disponíveis
- Frontend: http://localhost:3000
- Python API: http://localhost:8000
- Go API: http://localhost:8080
- PostgreSQL: localhost:5432
- PgBouncer: localhost:6432

### Executar Migrações
```bash
# Entrar no container Python
docker-compose exec python-api bash

# Criar migração
alembic revision --autogenerate -m "Descrição da mudança"

# Aplicar migração
alembic upgrade head
```

---

## Opção 2: Dev Containers (VS Code)

### Abrir no Dev Container
1. Instale a extensão "Dev Containers"
2. Pressione `F1` → "Dev Containers: Reopen in Container"
3. Aguarde build do container
4. Terminal integrado terá acesso a todas as ferramentas

### Vantagens
- Ambiente isolado e consistente
- Extensões pré-configuradas
- Ferramentas instaladas automaticamente

---

## Desenvolvimento Local (Sem Docker)

### Backend Python

```bash
cd services/python-api

# Criar virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edite DATABASE_URL para apontar para seu PostgreSQL local

# Executar migrações
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

### Backend Go

```bash
cd services/go-api

# Baixar dependências
go mod download

# Configurar .env
cp .env.example .env

# Executar
go run cmd/server/main.go
```

### Frontend Next.js

```bash
cd frontend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env.local

# Iniciar dev server
npm run dev
```

---

## Estrutura do Projeto

```
Projeto-paywinapp/
├── .devcontainer/          # Dev Containers config
│   ├── devcontainer.json
│   ├── post-create.sh
│   └── post-start.sh
│
├── services/
│   ├── python-api/        # FastAPI Backend
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   ├── database.py
│   │   │   ├── auth.py
│   │   │   └── routers/
│   │   ├── alembic/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── go-api/            # Go High Performance
│       ├── cmd/server/
│       ├── internal/
│       │   ├── handlers/
│       │   ├── models/
│       │   └── database/
│       ├── go.mod
│       └── Dockerfile
│
├── frontend/              # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── Dockerfile
│
├── db/                    # Database configs
│   └── init/
│       └── 01-init.sql
│
├── docs/                  # Documentação
│   ├── ARCHITECTURE.md
│   ├── ACCESSIBILITY.md
│   ├── LGPD.md
│   ├── API.md
│   └── ROADMAP.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Workflows de Desenvolvimento

### Criar Nova Feature

```bash
# 1. Criar branch
git checkout -b feature/nome-da-feature

# 2. Desenvolver
# ... fazer alterações ...

# 3. Testar localmente
docker-compose up -d
# Testar manualmente ou executar testes

# 4. Commit
git add .
git commit -m "feat: descrição da feature"

# 5. Push e PR
git push origin feature/nome-da-feature
# Criar Pull Request no GitHub
```

### Padrão de Commits (Conventional Commits)

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças em documentação
- `style:` Formatação (sem mudança de lógica)
- `refactor:` Refatoração de código
- `test:` Adicionar ou corrigir testes
- `chore:` Tarefas de manutenção

**Exemplos:**
```
feat: adicionar endpoint de exportação LGPD
fix: corrigir cálculo de progresso de metas
docs: atualizar README com instruções de setup
```

---

## Testes

### Python (Backend)
```bash
cd services/python-api

# Instalar dependências de teste
pip install pytest pytest-asyncio httpx

# Executar testes
pytest

# Com coverage
pytest --cov=app --cov-report=html
```

### Go (Backend)
```bash
cd services/go-api

# Executar testes
go test ./...

# Com coverage
go test -cover ./...
```

### Frontend (E2E)
```bash
cd frontend

# Instalar Playwright
npm install -D @playwright/test

# Executar testes E2E
npx playwright test

# Modo UI
npx playwright test --ui
```

---

## Debugging

### Python API (VS Code)
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "cwd": "${workspaceFolder}/services/python-api",
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  ]
}
```

### Go API (VS Code)
```json
{
  "name": "Go: Launch",
  "type": "go",
  "request": "launch",
  "mode": "debug",
  "program": "${workspaceFolder}/services/go-api/cmd/server",
  "cwd": "${workspaceFolder}/services/go-api"
}
```

---

## Database

### Acessar PostgreSQL
```bash
# Via Docker
docker-compose exec postgres psql -U paywinuser -d paywinapp

# Via PgBouncer
psql -h localhost -p 6432 -U paywinuser -d paywinapp
```

### Comandos Úteis
```sql
-- Listar tabelas
\dt

-- Descrever tabela
\d users

-- Ver dados
SELECT * FROM users LIMIT 10;

-- Resetar banco (CUIDADO!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### Criar Migração (Alembic)
```bash
# Auto-detect changes
alembic revision --autogenerate -m "Add column X to table Y"

# Aplicar
alembic upgrade head

# Reverter
alembic downgrade -1
```

---

## Troubleshooting

### Erro: "Port already in use"
```bash
# Encontrar processo usando a porta
# Linux/Mac:
lsof -i :8000

# Windows:
netstat -ano | findstr :8000

# Matar processo
kill -9 <PID>
```

### Erro: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar serviço
docker-compose restart postgres
```

### Erro: "Module not found" (Python)
```bash
# Reinstalar dependências
pip install -r requirements.txt

# Verificar ambiente virtual
which python
```

### Erro: "Cannot find module" (Node.js)
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## Boas Práticas

### Python
- Use type hints
- Docstrings em funções públicas
- Pydantic para validação
- Evite lógica em models (use services)
- Sempre filtre por `user_id`

### Go
- Sempre use context
- Error handling explícito
- Structs com tags JSON
- Connection pooling mínimo

### TypeScript
- Strict mode habilitado
- Evite `any`
- Props com interfaces
- Componentes funcionais

### Git
- Branches descritivas
- Commits pequenos e focados
- PR com descrição clara
- Code review obrigatório

---

## Recursos

### Documentação Oficial
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/docs)
- [Go](https://go.dev/doc/)
- [PostgreSQL](https://www.postgresql.org/docs/)

### Ferramentas
- [Postman](https://www.postman.com/) - Testar APIs
- [DBeaver](https://dbeaver.io/) - Cliente SQL
- [Insomnia](https://insomnia.rest/) - Cliente REST

---

## Contato

- Issues: GitHub Issues
- Discussões: GitHub Discussions
- Email: dev@paywinapp.com
