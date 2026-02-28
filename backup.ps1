# Script de Backup Automático - PayWinApp
# Execute manualmente ou agende no Task Scheduler

param(
    [string]$BackupDir = "backups",
    [int]$RetentionDays = 30
)

# Cores para output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Failure { Write-Host "❌ $args" -ForegroundColor Red }

Write-Info "Iniciando backup do PayWinApp..."

# Criar diretório de backup se não existir
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    Write-Success "Diretório de backup criado: $BackupDir"
}

# Timestamp para o arquivo
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
$backupFile = "$BackupDir/paywinapp-backup-$timestamp.sql"
$backupZip = "$backupFile.zip"

# Verificar se o container está rodando
Write-Info "Verificando container PostgreSQL..."
$containerRunning = docker ps --filter "name=paywin_postgres" --format "{{.Names}}"

if (-not $containerRunning) {
    Write-Failure "Container paywin_postgres não está rodando!"
    Write-Info "Execute: docker-compose up -d"
    exit 1
}

Write-Success "Container PostgreSQL está ativo"

# Fazer backup do banco de dados
Write-Info "Criando dump do banco de dados..."
try {
    docker exec paywin_postgres pg_dump -U paywinuser paywinapp > $backupFile
    
    if (Test-Path $backupFile) {
        $size = (Get-Item $backupFile).Length / 1KB
        Write-Success "Backup criado: $backupFile ($([math]::Round($size, 2)) KB)"
    } else {
        throw "Arquivo de backup não foi criado"
    }
} catch {
    Write-Failure "Erro ao criar backup: $_"
    exit 1
}

# Comprimir backup
Write-Info "Comprimindo backup..."
try {
    Compress-Archive -Path $backupFile -DestinationPath $backupZip -Force
    Remove-Item $backupFile
    
    $zipSize = (Get-Item $backupZip).Length / 1KB
    Write-Success "Backup comprimido: $backupZip ($([math]::Round($zipSize, 2)) KB)"
} catch {
    Write-Failure "Erro ao comprimir backup: $_"
    exit 1
}

# Backup do volume Docker (opcional - mais completo)
Write-Info "Criando backup do volume Docker..."
$volumeBackup = "$BackupDir/volume-backup-$timestamp.tar.gz"

try {
    docker run --rm -v paywin_postgres_data:/data -v "${PWD}:/backup" alpine tar czf "/backup/$volumeBackup" -C /data .
    
    if (Test-Path $volumeBackup) {
        $volSize = (Get-Item $volumeBackup).Length / 1KB
        Write-Success "Volume backup criado: $volumeBackup ($([math]::Round($volSize, 2)) KB)"
    }
} catch {
    Write-Warning "Erro ao criar backup do volume (não crítico): $_"
}

# Remover backups antigos
Write-Info "Limpando backups antigos (>${RetentionDays} dias)..."
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldBackups = Get-ChildItem $BackupDir -Filter "*.zip" | Where-Object {
    $_.LastWriteTime -lt $cutoffDate
}

if ($oldBackups) {
    foreach ($file in $oldBackups) {
        Remove-Item $file.FullName
        Write-Info "Removido backup antigo: $($file.Name)"
    }
    Write-Success "Removidos $($oldBackups.Count) backup(s) antigo(s)"
} else {
    Write-Info "Nenhum backup antigo para remover"
}

# Listar backups existentes
Write-Info "`nBackups disponíveis:"
Get-ChildItem $BackupDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending | ForEach-Object {
    $size = $_.Length / 1KB
    Write-Host "  📦 $($_.Name) - $([math]::Round($size, 2)) KB - $($_.LastWriteTime)" -ForegroundColor White
}

Write-Success "`n✨ Backup concluído com sucesso!"
Write-Info "Para restaurar, use: .\restore-backup.ps1 -BackupFile '$backupZip'"
