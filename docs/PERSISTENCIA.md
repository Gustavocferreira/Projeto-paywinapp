# Persistência de Dados - PayWinApp

## 🔒 Configuração de Persistência

O banco de dados PostgreSQL está configurado com **persistência permanente** usando volumes Docker.

### Volume Configurado
- **Nome:** `paywin_postgres_data`
- **Tipo:** Volume Docker local
- **Localização:** Gerenciado pelo Docker Engine
- **Dados armazenados:** Todos os dados do PostgreSQL (`/var/lib/postgresql/data`)

## ✅ O que Persiste

Mesmo após executar `docker-compose down`, os seguintes dados **NÃO serão perdidos**:
- ✅ Usuários cadastrados
- ✅ Transações financeiras
- ✅ Metas criadas
- ✅ Histórico de chat
- ✅ Categorias personalizadas
- ✅ Todas as configurações do banco

## ⚠️ Como Perder os Dados (Evite!)

Os dados **APENAS serão perdidos** se você executar:
```bash
docker-compose down -v  # O flag -v REMOVE os volumes!
```

## 🔄 Comandos Seguros

### Parar os containers SEM perder dados:
```bash
docker-compose down
```

### Reiniciar os containers:
```bash
docker-compose up -d
```

### Rebuild sem perder dados:
```bash
docker-compose up -d --build
```

### Ver containers rodando:
```bash
docker-compose ps
```

## 💾 Backup dos Dados

### Criar backup manual:
```powershell
# PowerShell
docker run --rm -v paywin_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/backup-postgres-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').tar.gz -C /data .
```

```bash
# Linux/Mac
docker run --rm -v paywin_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/backup-postgres-$(date +%Y-%m-%d-%H%M%S).tar.gz -C /data .
```

### Restaurar backup:
```powershell
# PowerShell
docker run --rm -v paywin_postgres_data:/data -v ${PWD}:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/SEU_ARQUIVO_BACKUP.tar.gz -C /data"
```

### Exportar banco de dados (SQL):
```bash
docker exec paywin_postgres pg_dump -U paywinuser paywinapp > backup-$(date +%Y-%m-%d).sql
```

### Importar banco de dados (SQL):
```bash
docker exec -i paywin_postgres psql -U paywinuser paywinapp < backup-2024-01-01.sql
```

## 🔍 Verificar Dados Persistentes

### Ver volumes Docker:
```bash
docker volume ls
```

### Inspecionar volume:
```bash
docker volume inspect paywin_postgres_data
```

### Ver tamanho do volume:
```bash
docker system df -v
```

### Listar usuários no banco:
```bash
docker exec -it paywin_python_api python -c "
from app.database import get_db
from app.models import User

db = next(get_db())
users = db.query(User).all()

print(f'Total de usuários: {len(users)}')
for user in users:
    print(f'  - ID: {user.id}, Email: {user.email}, Nome: {user.name}')
"
```

## 🗑️ Limpar Dados (Use com Cuidado!)

### Remover APENAS o volume de dados:
```bash
# ATENÇÃO: Isto apaga TODOS os dados!
docker-compose down -v
```

### Remover volume específico:
```bash
# ATENÇÃO: Isto apaga TODOS os dados do PostgreSQL!
docker volume rm paywin_postgres_data
```

### Resetar banco mantendo estrutura:
```bash
# Conectar ao banco e executar:
docker exec -it paywin_postgres psql -U paywinuser paywinapp -c "
TRUNCATE users, transactions, goals, categories, chat_messages CASCADE;
"
```

## 🔐 Segurança e Manutenção

### Backup Automático (Recomendado)

Crie um script de backup automático diário:

**backup-daily.ps1** (PowerShell):
```powershell
$backupDir = "backups"
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
$backupFile = "$backupDir/postgres-backup-$timestamp.sql"

# Criar diretório se não existir
New-Item -ItemType Directory -Force -Path $backupDir

# Fazer backup
docker exec paywin_postgres pg_dump -U paywinuser paywinapp > $backupFile

# Comprimir
Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip"
Remove-Item $backupFile

# Remover backups antigos (manter últimos 30 dias)
Get-ChildItem $backupDir -Filter "*.zip" | Where-Object {
    $_.LastWriteTime -lt (Get-Date).AddDays(-30)
} | Remove-Item

Write-Host "✅ Backup criado: $backupFile.zip"
```

**Agendar no Windows Task Scheduler:**
```powershell
# Executar diariamente às 3h da manhã
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\caminho\backup-daily.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "PayWinApp Backup" -Description "Backup diário do banco de dados"
```

## 📊 Monitoramento

### Ver logs do PostgreSQL:
```bash
docker logs paywin_postgres --tail 50 -f
```

### Conectar ao banco via psql:
```bash
docker exec -it paywin_postgres psql -U paywinuser paywinapp
```

### Verificar conexões ativas:
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'paywinapp';
```

## 🚀 Migração de Dados

### Exportar para outro servidor:
```bash
# 1. Criar backup
docker exec paywin_postgres pg_dump -U paywinuser -F c paywinapp > paywinapp.dump

# 2. Copiar paywinapp.dump para o novo servidor

# 3. Restaurar no novo servidor
docker exec -i paywin_postgres_novo pg_restore -U paywinuser -d paywinapp < paywinapp.dump
```

### Clonar volume:
```bash
# Criar novo volume
docker volume create paywin_postgres_data_clone

# Copiar dados
docker run --rm -v paywin_postgres_data:/source -v paywin_postgres_data_clone:/dest alpine sh -c "cp -a /source/. /dest/"
```

## 📝 Notas Importantes

1. **O volume persiste entre rebuilds**: Mesmo fazendo `docker-compose up --build`, os dados não são perdidos
2. **Localização dos dados**: Os dados ficam em um diretório gerenciado pelo Docker (não no seu projeto)
3. **Portabilidade**: Para mover o projeto para outro computador, faça backup via SQL dump
4. **Desenvolvimento**: Nunca use `-v` em desenvolvimento a menos que queira resetar tudo
5. **Produção**: Em produção, configure backups automáticos diários

## 🎯 Usuário de Teste Atual

Para facilitar testes, há um usuário criado:
- **Email:** `teste@exemplo.com`
- **Senha:** `TesteSenha123`

Este usuário persiste enquanto o volume existir.
