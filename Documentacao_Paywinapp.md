projeto "PayWinApp", app de finanças pessoais com agente conversacional e foco em acessibilidade e LGPD.
Stack alvo: Next.js (TypeScript) + Python/SQLAlchemy (admin/dados) + Go (rotas críticas) + PostgreSQL + PgBouncer + Docker/Dev Containers.
-->

# Especificação do Projeto – Meu Money (Finanças Pessoais com IA e Arquitetura Poliglota)

## 1. Objetivo do Projeto

Criar um aplicativo de finanças pessoais chamado **PayWinApp**, com foco em iniciantes em organização financeira, onde o usuário conversa em linguagem natural com um **Agente Financeiro** para registrar gastos, criar metas e receber recomendações personalizadas.

O app deve:
- Permitir registrar gastos/receitas via chat em linguagem natural.
- Ajudar a criar e acompanhar metas financeiras.
- Oferecer relatórios simples, gráficos e mensagens motivacionais.
- Respeitar princípios de **design universal**, **acessibilidade** e **LGPD**.
- Demonstrar uma arquitetura poliglota moderna (Next.js + Python + Go + PostgreSQL), explorando o melhor de cada linguagem.

## 2. Público-Alvo e Tom

- Pessoas que estão começando a organizar suas finanças.
- Usuários que buscam praticidade, simplicidade e linguagem clara.
- Jovens adultos e iniciantes em educação financeira.

Tom do app e do Agente Financeiro:
- Amigável, educativo e encorajador.
- Evita jargão técnico financeiro.
- Focado em hábitos sustentáveis, não em promessas de lucro rápido.

## 3. Escopo do MVP

### 3.1 Funcionalidades obrigatórias

1. **Autenticação e segurança**
   - Cadastro com nome, e-mail e senha.
   - Login com e-mail e senha.
   - Recuperação de senha via e-mail (fluxo simples).
   - Cada usuário vê apenas seus próprios dados (isolamento lógico por usuário).

2. **Agente Financeiro (chat)**
   - Interface de chat no frontend (Next.js).
   - Usuário envia frases em linguagem natural, por exemplo:
     - “Gastei R$ 80 em um jantar ontem.”
     - “Quero economizar R$ 500 este mês.”
   - Backend interpreta:
     - Valor, data, tipo (despesa/receita) e categoria aproximada.
     - Cria transações e/ou metas associadas ao usuário.
   - Histórico de conversas salvo em banco de dados.
   - Respostas do agente em português, com tom educativo.

3. **Metas financeiras**
   - Criação manual de metas via formulário (nome, valor alvo, data alvo opcional).
   - Criação automática de metas a partir de comandos no chat.
   - Visualização do progresso das metas com barras/indicadores.

4. **Dashboard e transações**
   - Registro manual de transações (valor, data, tipo, categoria, descrição).
   - Exibição de:
     - Saldo atual (receitas – despesas).
     - Receitas e despesas do mês.
     - Economia acumulada.
   - Gráficos:
     - Pizza: gastos por categoria.
     - Barras: receita vs despesa no mês atual.
   - Lista de transações recentes.

5. **Design e acessibilidade**
   - Interface responsiva (desktop e mobile).
   - Navegação por teclado.
   - Labels acessíveis e atributos `aria-*` em formulários.
   - Contraste adequado entre texto e fundo.
   - Layout minimalista, limpo e convidativo.

### 3.2 Fora de escopo inicial

- Integrações reais com bancos externos.
- Algoritmos avançados de recomendação de investimentos.
- Orquestração sofisticada (Kubernetes) – usar Docker Compose e Dev Containers.

## 4. Arquitetura Técnica

### 4.1 Visão geral dos componentes

- **Frontend Web**
  - **Stack**: Next.js + TypeScript.
  - Responsável por:
    - UI de login/cadastro.
    - Tela de chat do Agente Financeiro.
    - Dashboard, gráficos, metas, transações.
  - Comunicação com:
    - Backend Python (admin, operações de dados gerais).
    - Serviço Go (rotas críticas de alta performance).

- **Backend Python (Admin & Data Intelligence)**
  - Framework: FastAPI ou Flask (escolher um e manter consistente).
  - ORM: **SQLAlchemy** (com Alembic para migrações).
  - Responsável por:
    - Modelos de domínio (`User`, `Transaction`, `Goal`, `ChatMessage`, `Category`).
    - APIs de CRUD para usuários, transações, metas, categorias.
    - Camada de “inteligência de dados”:
      - Cálculos agregados simples (por ex.: totais por categoria, economia do mês).
      - Endpoints usados pelo Django Admin ou painel administrativo.
    - Integração com painel administrativo:
      - Pode usar **Django Admin** em um serviço separado OU um painel admin customizado.
      - Se Django for usado apenas como Admin, ele deve compartilhar o mesmo banco (PostgreSQL) via SQLAlchemy ou camada compatível.
  - Observação: manter a lógica de negócio **explícita** em código Python, sem triggers complexas no banco.

- **Serviço Go (Rotas Críticas)**
  - Responsável por:
    - Endpoints que exigem alta performance ou alta concorrência.
    - Exemplos:
      - Processamento de grandes volumes de transações.
      - Endpoints de agregação e relatórios pesados (mas com muitos acessos simultâneos).
      - Upload/processamento de arquivos (.csv de transações, por exemplo).
  - Deve:
    - Ler e escrever no mesmo PostgreSQL.
    - Respeitar a mesma modelagem de dados (tabelas e colunas com nomes **claros**).
    - Evitar qualquer dependência de lógica oculta em banco (sem triggers complexas, sem funções proprietárias que só uma linguagem conhece).

- **Banco de Dados**
  - PostgreSQL como banco principal.
  - Pooling de conexões via **PgBouncer**, compartilhado por Python e Go.
  - Esquema com tabelas principais:
    - `users`
    - `transactions`
    - `goals`
    - `chat_messages`
    - `categories`
  - Regras:
    - Nomes de colunas e tabelas em inglês e claros (ex.: `user_id`, `created_at`, `amount`, `goal_id`).
    - Evitar triggers complexas, lógicas de negócio devem ficar no código (Python/Go).

- **Infraestrutura**
  - **Docker** para todos os serviços:
    - Container para Next.js.
    - Container para backend Python.
    - Container para serviço Go.
    - Container para PostgreSQL.
    - Container para PgBouncer.
  - Suporte a **Dev Containers** (VS Code):
    - Arquivo `.devcontainer/devcontainer.json` configurando:
      - Serviços necessários.
      - Volumes para dados e código.
      - Ferramentas básicas (Node, Python, Go, psql, etc.).
  - **Docker Compose** para orquestrar ambiente de desenvolvimento.

### 4.2 Fluxos de comunicação (alto nível)

- Next.js → Python:
  - CRUD de usuários, metas, transações.
  - Consultas padrão de dashboard.
  - Operações de chat que não exigem alta performance.

- Next.js → Go:
  - Consultas e operações marcadas como “rotas críticas”, por exemplo:
    - Endpoint `/api/high-volume/transactions/summary`.
    - Processamento de importações de grandes arquivos de transações.

- Python ↔ Go ↔ PostgreSQL:
  - Ambos falam com o mesmo PostgreSQL via PgBouncer.
  - Devem compartilhar o mesmo esquema e convenções de nomes.

## 5. Modelagem de Dados (Resumo)

Entidades principais (nomes em inglês, labels em português na UI):

- `User`
  - `id`, `name`, `email`, `hashed_password`, `created_at`, `updated_at`.

- `Transaction`
  - `id`, `user_id`, `amount`, `type` (`income` ou `expense`), `category_id`, `description`, `occurred_at`, `created_at`.

- `Goal`
  - `id`, `user_id`, `name`, `target_amount`, `current_amount`, `due_date` (opcional), `created_at`.

- `ChatMessage`
  - `id`, `user_id`, `role` (`user` ou `agent`), `content`, `created_at`.

- `Category`
  - `id`, `name`, `type` (`income` ou `expense`), `created_at`.

Regra importante para a IA:  
> **Não** criar triggers complexas ou lógica escondida no banco. Toda regra de negócio deve estar explícita em serviços Python ou Go.

## 6. Requisitos Não Funcionais

### 6.1 Acessibilidade e design universal

- Seguir boas práticas WCAG (básico):
  - Labels, `aria-*`, foco visível.
  - Navegação via teclado em fluxos principais.
  - Contraste adequado.
- Layout simples, com cores que transmitam confiança (azuis, verdes, neutros).

### 6.2 Segurança e LGPD

- HTTPS em produção.
- Senhas com hash seguro (ex.: bcrypt).
- Dados sensíveis:
  - Nunca em texto puro em logs.
  - Criptografia em repouso para campos sensíveis se necessário.
- LGPD:
  - Consentimento explícito de uso de dados no cadastro.
  - Estrutura para exclusão de conta/dados.
- Logs:
  - Registar erros e operações críticas (sem dados sensíveis).

### 6.3 Conexões e PgBouncer

- Todos os serviços (Python e Go) conectam no PostgreSQL via PgBouncer.
- Configurar:
  - Pool de conexões para lidar com concorrência do Go e conexões síncronas do Python.
- Evitar abrir conexões diretas repetidas no código:
  - Usar pools gerenciados pelas libs de cada linguagem.

## 7. Comportamento do Agente de IA

Mesmo que a integração com um LLM externo não esteja completa, a arquitetura deve:

- Ter um serviço dedicado (por exemplo, `AiAgentService`) que:
  - Recebe mensagem do usuário, carrega dados relevantes (transações, metas).
  - Gera uma resposta textual em português.
- Permitir trocar facilmente o provedor de IA (Gemini, OpenAI, etc.).
- Manter as regras:
  - Respostas educativas, sem promessas de ganhos garantidos.
  - Sempre baseadas nos dados reais do usuário.

## 8. Como o Copilot deve ajudar

Você, Copilot, deve:

1. **Ler este documento inteiro antes de sugerir código.**

2. Criar a estrutura inicial com:
   - `frontend/` → app Next.js com TypeScript.
   - `services/python-api/` → backend Python com SQLAlchemy (e, se usado, integração com Django Admin).
   - `services/go-api/` → serviço Go para rotas críticas.
   - `db/` → configuração de PostgreSQL.
   - `infra/` → configuração de PgBouncer (opcionalmente em `db/`).
   - `docker-compose.yml` e arquivos de `Dockerfile` para cada serviço.
   - `.devcontainer/` com `devcontainer.json` e config de volumes.

3. Implementar, em etapas, na ordem:

   1. **Modelagem de dados e migrações** no backend Python (SQLAlchemy + Alembic).
   2. **APIs REST básicas no Python** para:
      - Autenticação.
      - CRUD de transações.
      - CRUD de metas.
      - Consulta de dashboard simples.
   3. **Serviço Go** com pelo menos um endpoint crítico de exemplo:
      - Ex.: `/highload/transactions/summary` otimizando leitura/agrupamento de transações.
   4. **Integração Next.js → Python/Go**:
      - Páginas para login/cadastro.
      - Tela de dashboard.
      - Tela de metas.
      - Tela de chat.
   5. **Configuração de Docker e Dev Containers**:
      - Containers subindo e se comunicando via docker-compose.
      - Volumes para banco e código quando fizer sentido.


---