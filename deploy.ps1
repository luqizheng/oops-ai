# OOPS-AI PowerShell 部署脚本
# 使用方法: .\deploy.ps1 [dev|prod|test]

param(
    [string]$Command = "deploy",
    [string]$Environment = "dev",
    [string]$Service = ""
)

# 颜色定义
$ESC = [char]27
$RED = "$ESC[31m"
$GREEN = "$ESC[32m"
$YELLOW = "$ESC[33m"
$BLUE = "$ESC[34m"
$NC = "$ESC[0m"

# 环境变量文件
$ENV_FILE = ".env"

# 打印带颜色的消息
function Write-Info {
    param([string]$Message)
    Write-Host "$BLUE[INFO]$NC $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "$GREEN[SUCCESS]$NC $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$YELLOW[WARNING]$NC $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "$RED[ERROR]$NC $Message"
}

# 检查 Docker 和 Docker Compose
function Check-Dependencies {
    Write-Info "检查依赖..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker 未安装，请先安装 Docker"
        exit 1
    }
    
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    }
    
    Write-Success "依赖检查通过"
}

# 加载环境变量
function Load-Environment {
    param([string]$EnvType)
    
    $envFile = "$ENV_FILE.$EnvType"
    if (Test-Path $envFile) {
        Write-Info "加载 $envFile 环境变量"
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    } elseif (Test-Path $ENV_FILE) {
        Write-Info "加载 $ENV_FILE 环境变量"
        Get-Content $ENV_FILE | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    } else {
        Write-Warning "未找到环境变量文件，使用默认值"
    }
}

# 开发环境部署
function Deploy-Dev {
    Write-Info "开始开发环境部署..."
    
    # 构建并启动服务
    docker-compose -f docker-compose.dev.yml up -d --build
    
    # 等待服务启动
    Start-Sleep -Seconds 10
    
    # 运行数据库迁移
    Write-Info "运行数据库迁移..."
    docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
    
    Write-Success "开发环境部署完成"
    Write-Info "前端访问: http://localhost:5173"
    Write-Info "后端API: http://localhost:3000"
    Write-Info "数据库: localhost:5432"
}

# 生产环境部署
function Deploy-Prod {
    Write-Info "开始生产环境部署..."
    
    # 检查必要的环境变量
    if (-not $env:OPENAI_API_KEY -and -not $env:DEEPSEEK_API_KEY -and -not $env:QIANWEN_API_KEY) {
        Write-Warning "未设置任何 LLM API 密钥，部分功能可能无法使用"
    }
    
    # 构建并启动服务
    docker-compose -f docker-compose.yml up -d --build
    
    # 等待服务启动
    Start-Sleep -Seconds 15
    
    # 运行数据库迁移
    Write-Info "运行数据库迁移..."
    docker-compose exec backend npx prisma migrate deploy
    
    Write-Success "生产环境部署完成"
    Write-Info "应用访问: http://localhost"
    Write-Info "API访问: http://localhost/api"
    Write-Info "数据库: localhost:5432"
}

# 测试环境部署
function Deploy-Test {
    Write-Info "开始测试环境部署..."
    
    # 构建并启动服务
    docker-compose -f docker-compose.test.yml up -d --build
    
    # 等待服务启动
    Start-Sleep -Seconds 10
    
    Write-Success "测试环境部署完成"
    Write-Info "前端访问: http://localhost:4173"
    Write-Info "后端API: http://localhost:3001"
}

# 停止服务
function Stop-Services {
    param([string]$EnvType)
    
    switch ($EnvType) {
        "dev" { docker-compose -f docker-compose.dev.yml down }
        "prod" { docker-compose down }
        "test" { docker-compose -f docker-compose.test.yml down }
        default { docker-compose down }
    }
    
    Write-Success "服务已停止"
}

# 查看日志
function View-Logs {
    param([string]$Service, [string]$EnvType)
    
    switch ($EnvType) {
        "dev" { docker-compose -f docker-compose.dev.yml logs -f $Service }
        "prod" { docker-compose logs -f $Service }
        "test" { docker-compose -f docker-compose.test.yml logs -f $Service }
        default { docker-compose logs -f $Service }
    }
}

# 重启服务
function Restart-Services {
    param([string]$EnvType)
    
    switch ($EnvType) {
        "dev" { docker-compose -f docker-compose.dev.yml restart }
        "prod" { docker-compose restart }
        "test" { docker-compose -f docker-compose.test.yml restart }
        default { docker-compose restart }
    }
    
    Write-Success "服务已重启"
}

# 清理资源
function Cleanup {
    Write-Info "清理未使用的 Docker 资源..."
    
    docker system prune -f
    docker volume prune -f
    
    Write-Success "清理完成"
}

# 备份数据库
function Backup-Database {
    $backupDir = "backups"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$backupDir/backup_$timestamp.sql"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    Write-Info "备份数据库到 $backupFile"
    
    docker-compose exec postgres pg_dump -U oops_user oops_ai > $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "数据库备份成功: $backupFile"
    } else {
        Write-Error "数据库备份失败"
    }
}

# 显示帮助信息
function Show-Help {
    Write-Host "OOPS-AI 部署脚本"
    Write-Host ""
    Write-Host "使用方法: .\deploy.ps1 [命令] [环境] [服务]"
    Write-Host ""
    Write-Host "命令:"
    Write-Host "  deploy    部署服务 (默认命令)"
    Write-Host "  stop      停止服务"
    Write-Host "  logs      查看日志"
    Write-Host "  restart   重启服务"
    Write-Host "  cleanup   清理 Docker 资源"
    Write-Host "  backup    备份数据库"
    Write-Host "  help      显示帮助信息"
    Write-Host ""
    Write-Host "环境:"
    Write-Host "  dev       开发环境 (默认)"
    Write-Host "  prod      生产环境"
    Write-Host "  test      测试环境"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  .\deploy.ps1 deploy prod      # 部署生产环境"
    Write-Host "  .\deploy.ps1 logs backend     # 查看后端日志"
    Write-Host "  .\deploy.ps1 stop dev         # 停止开发环境"
}

# 主函数
function Main {
    switch ($Command.ToLower()) {
        "deploy" {
            Check-Dependencies
            Load-Environment $Environment
            
            switch ($Environment.ToLower()) {
                "dev" { Deploy-Dev }
                "prod" { Deploy-Prod }
                "test" { Deploy-Test }
                default {
                    Write-Error "未知环境类型: $Environment"
                    Show-Help
                    exit 1
                }
            }
        }
        "stop" {
            Stop-Services $Environment
        }
        "logs" {
            View-Logs $Service $Environment
        }
        "restart" {
            Restart-Services $Environment
        }
        "cleanup" {
            Cleanup
        }
        "backup" {
            Backup-Database
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "未知命令: $Command"
            Show-Help
            exit 1
        }
    }
}

# 执行主函数
Main