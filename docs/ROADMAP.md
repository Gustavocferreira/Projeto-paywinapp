# Roadmap de Desenvolvimento - PayWinApp

## Visão Geral

Desenvolvimento dividido em **4 Sprints focadas no MVP**, cada uma com duração de 2-3 semanas.

---

## Sprint 1: Fundação e Infraestrutura (2 semanas)

### Objetivos
Estabelecer a base técnica completa do projeto.

### Entregas

#### 1.1 Infraestrutura
- [x] Configuração Docker Compose
- [x] Setup de Dev Containers
- [x] PostgreSQL + PgBouncer
- [x] Scripts de inicialização do banco

#### 1.2 Backend Python
- [x] Estrutura do projeto FastAPI
- [x] Models SQLAlchemy (User, Transaction, Goal, ChatMessage, Category)
- [x] Migrações Alembic (versão inicial)
- [x] Configuração de database com PgBouncer

#### 1.3 Backend Go
- [x] Estrutura do projeto
- [x] Connection pool com pgx
- [x] Health check endpoint

#### 1.4 Frontend Next.js
- [x] Setup Next.js 14 com TypeScript
- [x] Configuração Tailwind CSS
- [x] Estrutura de pastas
- [x] Página inicial (landing page)

#### 1.5 Autenticação (MVP básico)
- [ ] Endpoint de registro (`POST /api/v1/auth/register`)
- [ ] Endpoint de login (`POST /api/v1/auth/login`)
- [ ] Geração de JWT tokens
- [ ] Middleware de autenticação
- [ ] Página de login (frontend)
- [ ] Página de registro (frontend)
- [ ] Fluxo de autenticação completo

### Critérios de Aceitação
- ✅ Docker Compose sobe todos os serviços com sucesso
- ✅ Banco de dados com estrutura completa
- ⏳ Usuário consegue se registrar e fazer login
- ⏳ Token JWT gerado e validado corretamente
- ⏳ Frontend redirecionando baseado em autenticação

### Riscos
- **Médio**: Configuração de PgBouncer pode exigir ajustes finos
- **Baixo**: Integração entre serviços via Docker network

---

## Sprint 2: CRUD Core e Dashboard (3 semanas)

### Objetivos
Implementar funcionalidades principais de transações, metas e visualização.

### Entregas

#### 2.1 Transações (Backend Python)
- [ ] CRUD completo de transações
  - `POST /api/v1/transactions` - Criar
  - `GET /api/v1/transactions` - Listar (com filtros e paginação)
  - `GET /api/v1/transactions/{id}` - Detalhes
  - `PATCH /api/v1/transactions/{id}` - Atualizar
  - `DELETE /api/v1/transactions/{id}` - Excluir
- [ ] Validação de dados (Pydantic)
- [ ] Testes unitários

#### 2.2 Metas (Backend Python)
- [ ] CRUD completo de metas
  - `POST /api/v1/goals` - Criar
  - `GET /api/v1/goals` - Listar
  - `GET /api/v1/goals/{id}` - Detalhes
  - `PATCH /api/v1/goals/{id}` - Atualizar
  - `POST /api/v1/goals/{id}/contribute` - Adicionar progresso
  - `DELETE /api/v1/goals/{id}` - Excluir
- [ ] Cálculo de progresso (em código, não triggers)

#### 2.3 Dashboard (Backend Python + Go)
- [ ] Python: `GET /api/v1/dashboard` (dashboard completo)
- [ ] Python: Agregações de transações por categoria
- [ ] Python: Lista de transações recentes
- [ ] Python: Lista de metas ativas
- [ ] Go: `GET /api/v1/highload/transactions/summary` (otimizado)
- [ ] Go: `GET /api/v1/highload/reports/monthly` (relatório mensal)

#### 2.4 Frontend - Telas Principais
- [ ] Layout autenticado (sidebar, header)
- [ ] Dashboard page
  - Resumo financeiro (cards)
  - Gráfico de pizza (gastos por categoria)
  - Gráfico de barras (receita vs despesa)
  - Lista de transações recentes
  - Progresso de metas
- [ ] Página de transações
  - Formulário de criar/editar
  - Lista com filtros
  - Paginação
- [ ] Página de metas
  - Formulário de criar/editar
  - Cards de progresso
  - Barra de progresso visual

#### 2.5 Acessibilidade (Primeira Iteração)
- [ ] Navegação por teclado funcional
- [ ] Labels ARIA em formulários
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] Skip to main content

### Critérios de Aceitação
- ✅ Usuário consegue criar, visualizar, editar e excluir transações
- ✅ Usuário consegue criar e acompanhar metas
- ✅ Dashboard exibe dados corretos e atualizados
- ✅ Gráficos renderizam corretamente com dados reais
- ✅ Responsive design (desktop e mobile)
- ✅ Navegação básica por teclado funciona

### Riscos
- **Alto**: Complexidade dos cálculos de agregação no dashboard
- **Médio**: Performance de queries no PostgreSQL (otimizar com índices)
- **Baixo**: Integração de bibliotecas de gráficos (Recharts)

---

## Sprint 3: Agente Conversacional e IA (3 semanas)

### Objetivos
Implementar o diferencial do app: chat com Agente Financeiro.

### Entregas

#### 3.1 Chat Backend (Python)
- [ ] Endpoints de chat
  - `POST /api/v1/chat/message` - Enviar mensagem
  - `GET /api/v1/chat/sessions` - Listar sessões
  - `GET /api/v1/chat/session/{id}` - Histórico de sessão
- [ ] Salvamento de mensagens no banco
- [ ] Geração de session_id

#### 3.2 Integração com LLM
- [ ] Configurar Gemini API ou OpenAI
- [ ] Service de processamento de linguagem natural
- [ ] Detecção de intenções:
  - Registrar gasto/receita
  - Criar meta
  - Consultar saldo
  - Ver relatório
- [ ] Extração de entidades:
  - Valor (R$ 100, cem reais)
  - Data (ontem, 15/02, semana passada)
  - Categoria (alimentação, transporte)
- [ ] Geração de respostas contextuais

#### 3.3 Ações Automáticas
- [ ] Criar transação a partir de mensagem
- [ ] Criar meta a partir de mensagem
- [ ] Retornar resumos financeiros
- [ ] Sugestões e dicas educativas

#### 3.4 Chat UI (Frontend)
- [ ] Interface de chat (bubble style)
- [ ] Input com envio por Enter
- [ ] Exibição de mensagens user/agent
- [ ] Indicador de "digitando..."
- [ ] Histórico de sessões
- [ ] Auto-scroll
- [ ] Acessível (ARIA live regions)

#### 3.5 Educação Financeira
- [ ] Mensagens motivacionais
- [ ] Dicas baseadas em padrões de gastos
- [ ] Alertas de metas próximas do prazo
- [ ] Tom amigável e não julgador

### Critérios de Aceitação
- ✅ Usuário envia mensagem em linguagem natural
- ✅ Agente identifica intenção corretamente (80%+ de acurácia)
- ✅ Transações criadas via chat aparecem no dashboard
- ✅ Metas criadas via chat aparecem na lista de metas
- ✅ Respostas do agente são claras e educativas
- ✅ Interface de chat é intuitiva e responsiva
- ✅ Histórico de conversas é salvo e recuperável

### Riscos
- **Alto**: Acurácia da detecção de intenções
- **Alto**: Parsing de valores e datas em português
- **Médio**: Custo de APIs de LLM (monitorar uso)
- **Médio**: Latência de respostas (timeout adequado)

---

## Sprint 4: LGPD, Polish e Deploy (2 semanas)

### Objetivos
Finalizar conformidade LGPD, acessibilidade completa e preparar para produção.

### Entregas

#### 4.1 LGPD Compliance (Backend)
- [ ] Endpoints de LGPD
  - `GET /api/v1/lgpd/data-summary` - Resumo de dados
  - `GET /api/v1/lgpd/export` - Exportar dados (JSON)
  - `POST /api/v1/lgpd/delete-account` - Direito ao esquecimento
  - `PATCH /api/v1/lgpd/consent` - Revogar/conceder consentimento
- [ ] Validação de consentimento no registro
- [ ] Logs de auditoria (sem dados sensíveis)
- [ ] Política de retenção (30 dias pós-desativação)

#### 4.2 LGPD Compliance (Frontend)
- [ ] Página de Política de Privacidade
- [ ] Página de Termos de Uso
- [ ] Config de consentimento
- [ ] Exportação de dados (botão)
- [ ] Exclusão de conta (com confirmação dupla)

#### 4.3 Acessibilidade Completa
- [ ] Auditoria com axe DevTools
- [ ] Auditoria com Lighthouse
- [ ] Testes com screen reader (NVDA/VoiceOver)
- [ ] Navegação completa por teclado
- [ ] Landmarks ARIA
- [ ] Live regions para notificações
- [ ] Contraste AAA onde possível
- [ ] Documentação de acessibilidade

#### 4.4 Performance e Otimização
- [ ] Lazy loading de componentes
- [ ] Otimização de imagens (Next.js Image)
- [ ] Code splitting
- [ ] Caching de queries (frontend)
- [ ] Índices otimizados no banco
- [ ] Lighthouse score > 90

#### 4.5 Testes
- [ ] Testes unitários (backend Python) - 70%+ coverage
- [ ] Testes de integração (APIs)
- [ ] Testes E2E (Playwright - fluxos principais)
- [ ] Testes de acessibilidade automatizados

#### 4.6 Documentação
- [ ] README completo
- [ ] ARCHITECTURE.md
- [ ] ACCESSIBILITY.md
- [ ] LGPD.md
- [ ] API.md (referência de endpoints)
- [ ] DEVELOPMENT.md (guia para devs)

#### 4.7 Deploy (Preparação)
- [ ] Variáveis de ambiente para produção
- [ ] Secrets management
- [ ] CI/CD pipeline básico
- [ ] Dockerfile otimizado (multi-stage)
- [ ] Health checks
- [ ] Logging estruturado
- [ ] Monitoring básico

### Critérios de Aceitação
- ✅ Conformidade LGPD 100%
- ✅ Acessibilidade WCAG 2.1 AA
- ✅ Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- ✅ Testes com cobertura > 70%
- ✅ Documentação completa
- ✅ Aplicação pronta para deploy

### Riscos
- **Médio**: Tempo para correção de issues de acessibilidade
- **Baixo**: Setup de CI/CD
- **Baixo**: Documentação técnica

---

## Pós-MVP (Backlog Futuro)

### Features Avançadas
- [ ] Integração com Open Banking (leitura de extratos)
- [ ] Notificações push (web push)
- [ ] Múltiplas moedas
- [ ] Orçamentos mensais (budgets)
- [ ] Categorias customizadas por usuário
- [ ] Anexos em transações (fotos de recibos)
- [ ] Compartilhamento de metas (família)
- [ ] App mobile (React Native ou Flutter)

### Infraestrutura
- [ ] Kubernetes deployment
- [ ] Escalamento horizontal
- [ ] Redis para caching
- [ ] CDN para assets
- [ ] Backup automatizado
- [ ] Disaster recovery plan

### Observabilidade
- [ ] Prometheus + Grafana
- [ ] OpenTelemetry tracing
- [ ] Sentry para errors
- [ ] ELK stack para logs
- [ ] Uptime monitoring

### Segurança Avançada
- [ ] 2FA (two-factor authentication)
- [ ] Biometria (WebAuthn)
- [ ] Rate limiting
- [ ] WAF (Web Application Firewall)
- [ ] Penetration testing

---

## Métricas de Sucesso

### MVP (Sprint 4)
- ✅ 100 usuários beta testando
- ✅ Taxa de conclusão de registro > 80%
- ✅ Tempo médio de resposta < 500ms
- ✅ Uptime > 99%
- ✅ Zero vulnerabilidades críticas

### Pós-MVP (6 meses)
- 🎯 1.000 usuários ativos
- 🎯 10.000 transações registradas
- 🎯 500 metas criadas
- 🎯 Taxa de retenção (30 dias) > 40%
- 🎯 NPS > 50

---

## Cronograma Resumido

```
Sprint 1: Fundação           | Semanas 1-2  | ████████░░░░░░░░░░░░
Sprint 2: Core & Dashboard   | Semanas 3-5  | ░░░░░░░░████████████░░░░░░
Sprint 3: Agente IA          | Semanas 6-8  | ░░░░░░░░░░░░░░░░████████████
Sprint 4: Polish & Deploy    | Semanas 9-10 | ░░░░░░░░░░░░░░░░░░░░████████
```

**Total: 10 semanas (~2,5 meses)**

---

## Próximos Passos Imediatos

1. ✅ Estrutura do projeto criada
2. ⏳ Executar `docker-compose up` e validar integração
3. ⏳ Implementar autenticação completa (Sprint 1)
4. ⏳ Criar PR template e workflow de desenvolvimento
5. ⏳ Configurar linting e formatação (pre-commit hooks)
6. ⏳ Iniciar desenvolvimento de CRUD de transações (Sprint 2)

---

**Última atualização**: 27/02/2026  
**Status**: Sprint 1 - Fundação 80% completa
