# Script de Restauração - PayWinApp
# Restaura um backup do banco de dados

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

# Cores para output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Failure { Write-Host "❌ $args" -ForegroundColor Red }

Write-Warning "ATENÇÃO: Esta operação irá SUBSTITUIR todos os dados atuais do banco!"
$confirm = Read-Host "Deseja continuar? (digite 'SIM' para confirmar)"

if ($confirm -ne "SIM") {
    Write-Info "Operação cancelada pelo usuário"
    exit 0
}

# Verificar se o arquivo existe
if (-not (Test-Path $BackupFile)) {
    Write-Failure "Arquivo de backup não encontrado: $BackupFile"
    exit 1
}

Write-Info "Arquivo de backup: $BackupFile"

# Verificar se o container está rodando
Write-Info "Verificando container PostgreSQL..."
$containerRunning = docker ps --filter "name=paywin_postgres" --format "{{.Names}}"

if (-not $containerRunning) {
    Write-Failure "Container paywin_postgres não está rodando!"
    Write-Info "Execute: docker-compose up -d"
    exit 1
}

Write-Success "Container PostgreSQL está ativo"

# Descomprimir se for .zip
$sqlFile = $BackupFile
if ($BackupFile -match '\.zip$') {
    Write-Info "Descomprimindo backup..."
    $tempDir = New-Item -ItemType Directory -Path "temp_restore_$(Get-Date -Format 'yyyyMMddHHmmss')" -Force
    Expand-Archive -Path $BackupFile -DestinationPath $tempDir -Force
    $sqlFile = Get-ChildItem $tempDir -Filter "*.sql" | Select-Object -First 1 -ExpandProperty FullName
    
    if (-not $sqlFile) {
        Write-Failure "Nenhum arquivo .sql encontrado no backup"
        Remove-Item $tempDir -Recurse -Force
        exit 1
    }
    
    Write-Success "Backup descomprimido: $sqlFile"
}

# Criar backup de segurança antes de restaurar
Write-Info "Criando backup de segurança dos dados atuais..."
$safetyBackup = "backup-before-restore-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').sql"
docker exec paywin_postgres pg_dump -U paywinuser paywinapp > $safetyBackup
Write-Success "Backup de segurança criado: $safetyBackup"

# Restaurar banco de dados
Write-Info "Restaurando banco de dados..."
Write-Warning "Aguarde, isto pode levar alguns minutos..."

try {
    # Desconectar usuários ativos
    docker exec paywin_postgres psql -U paywinuser -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'paywinapp' AND pid <> pg_backend_pid();"
    
    # Dropar e recriar banco
    docker exec paywin_postgres psql -U paywinuser -d postgres -c "DROP DATABASE IF EXISTS paywinapp;"
    docker exec paywin_postgres psql -U paywinuser -d postgres -c "CREATE DATABASE paywinapp OWNER paywinuser;"
    
    # Restaurar dados
    Get-Content $sqlFile | docker exec -i paywin_postgres psql -U paywinuser paywinapp
    
    Write-Success "Banco de dados restaurado com sucesso!"
} catch {
    Write-Failure "Erro ao restaurar banco de dados: $_"
    Write-Warning "Você pode restaurar o backup de segurança:"
    Write-Info "Get-Content $safetyBackup | docker exec -i paywin_postgres psql -U paywinuser paywinapp"
    exit 1
}

# Limpar arquivos temporários
if ($BackupFile -match '\.zip$' -and (Test-Path $tempDir)) {
    Remove-Item $tempDir -Recurse -Force
    Write-Info "Arquivos temporários removidos"
}

# Verificar restauração
Write-Info "Verificando dados restaurados..."
docker exec paywin_python_api python -c "
from app.database import get_db
from app.models import User

try:
    db = next(get_db())
    users = db.query(User).all()
    print(f'✅ Verificação concluída: {len(users)} usuário(s) no banco')
except Exception as e:
    print(f'❌ Erro na verificação: {e}')
"

Write-Success "`n✨ Restauração concluída!"
Write-Info "Backup de segurança mantido em: $safetyBackup"
Write-Warning "Reinicie os containers para garantir que tudo esteja atualizado:"
Write-Info "docker-compose restart"
