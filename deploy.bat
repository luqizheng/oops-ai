@echo off
REM OOPS-AI Windows 部署脚本
REM 使用方法: deploy.bat [dev|prod|test]

setlocal enabledelayedexpansion

REM 颜色定义
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "RED=%ESC%[31m"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "NC=%ESC%[0m"

REM 环境变量文件
set "ENV_FILE=.env"

REM 打印带颜色的消息
:print_info
    echo %BLUE%[INFO]%NC% %*
    exit /b 0

:print_success
    echo %GREEN%[SUCCESS]%NC% %*
    exit /b 0

:print_warning
    echo %YELLOW%[WARNING]%NC% %*
    exit /b 0

:print_error
    echo %RED%[ERROR]%NC% %*
    exit /b 1

REM 检查 Docker 和 Docker Compose
:check_dependencies
    call :print_info "检查依赖..."
    
    where docker >nul 2>nul
    if errorlevel 1 (
        call :print_error "Docker 未安装，请先安装 Docker"
        exit /b 1
    )
    
    where docker-compose >nul 2>nul
    if errorlevel 1 (
        call :print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit /b 1
    )
    
    call :print_success "依赖检查通过"
    exit /b 0

REM 加载环境变量
:load_env
    set "env_type=%1"
    
    if exist "%ENV_FILE%.%env_type%" (
        call :print_info "加载 %ENV_FILE%.%env_type% 环境变量"
        for /f "usebackq delims=" %%i in ("%ENV_FILE%.%env_type%") do (
            set "%%i"
        )
    ) else if exist "%ENV_FILE%" (
        call :print_info "加载 %ENV_FILE% 环境变量"
        for /f "usebackq delims=" %%i in ("%ENV_FILE%") do (
            set "%%i"
        )
    ) else (
        call :print_warning "未找到环境变量文件，使用默认值"
    )
    exit /b 0

REM 开发环境部署
:deploy_dev
    call :print_info "开始开发环境部署..."
    
    REM 构建并启动服务
    docker-compose -f docker-compose.dev.yml up -d --build
    
    REM 等待服务启动
    timeout /t 10 /nobreak >nul
    
    REM 运行数据库迁移
    call :print_info "运行数据库迁移..."
    docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
    
    call :print_success "开发环境部署完成"
    echo.
    call :print_info "前端访问: http://localhost:5173"
    call :print_info "后端API: http://localhost:3000"
    call :print_info "数据库: localhost:5432"
    exit /b 0

REM 生产环境部署
:deploy_prod
    call :print_info "开始生产环境部署..."
    
    REM 检查必要的环境变量
    if "%OPENAI_API_KEY%"=="" if "%DEEPSEEK_API_KEY%"=="" if "%QIANWEN_API_KEY%"=="" (
        call :print_warning "未设置任何 LLM API 密钥，部分功能可能无法使用"
    )
    
    REM 构建并启动服务
    docker-compose -f docker-compose.yml up -d --build
    
    REM 等待服务启动
    timeout /t 15 /nobreak >nul
    
    REM 运行数据库迁移
    call :print_info "运行数据库迁移..."
    docker-compose exec backend npx prisma migrate deploy
    
    call :print_success "生产环境部署完成"
    echo.
    call :print_info "应用访问: http://localhost"
    call :print_info "API访问: http://localhost/api"
    call :print_info "数据库: localhost:5432"
    exit /b 0

REM 测试环境部署
:deploy_test
    call :print_info "开始测试环境部署..."
    
    REM 构建并启动服务
    docker-compose -f docker-compose.test.yml up -d --build
    
    REM 等待服务启动
    timeout /t 10 /nobreak >nul
    
    call :print_success "测试环境部署完成"
    echo.
    call :print_info "前端访问: http://localhost:4173"
    call :print_info "后端API: http://localhost:3001"
    exit /b 0

REM 停止服务
:stop_services
    set "env_type=%1"
    
    if "%env_type%"=="dev" (
        docker-compose -f docker-compose.dev.yml down
    ) else if "%env_type%"=="prod" (
        docker-compose down
    ) else if "%env_type%"=="test" (
        docker-compose -f docker-compose.test.yml down
    ) else (
        docker-compose down
    )
    
    call :print_success "服务已停止"
    exit /b 0

REM 查看日志
:view_logs
    set "service=%1"
    set "env_type=%2"
    
    if "%env_type%"=="dev" (
        docker-compose -f docker-compose.dev.yml logs -f %service%
    ) else if "%env_type%"=="prod" (
        docker-compose logs -f %service%
    ) else if "%env_type%"=="test" (
        docker-compose -f docker-compose.test.yml logs -f %service%
    ) else (
        docker-compose logs -f %service%
    )
    exit /b 0

REM 重启服务
:restart_services
    set "env_type=%1"
    
    if "%env_type%"=="dev" (
        docker-compose -f docker-compose.dev.yml restart
    ) else if "%env_type%"=="prod" (
        docker-compose restart
    ) else if "%env_type%"=="test" (
        docker-compose -f docker-compose.test.yml restart
    ) else (
        docker-compose restart
    )
    
    call :print_success "服务已重启"
    exit /b 0

REM 清理资源
:cleanup
    call :print_info "清理未使用的 Docker 资源..."
    
    docker system prune -f
    docker volume prune -f
    
    call :print_success "清理完成"
    exit /b 0

REM 备份数据库
:backup_database
    set "backup_dir=backups"
    for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
    set "timestamp=%dt:~0,8%_%dt:~8,6%"
    set "backup_file=%backup_dir%\backup_%timestamp%.sql"
    
    if not exist "%backup_dir%" mkdir "%backup_dir%"
    
    call :print_info "备份数据库到 %backup_file%"
    
    docker-compose exec postgres pg_dump -U oops_user oops_ai > "%backup_file%"
    
    if errorlevel 0 (
        call :print_success "数据库备份成功: %backup_file%"
    ) else (
        call :print_error "数据库备份失败"
    )
    exit /b 0

REM 显示帮助信息
:show_help
    echo OOPS-AI 部署脚本
    echo.
    echo 使用方法: %0 [命令] [环境]
    echo.
    echo 命令:
    echo   deploy    部署服务 (默认命令)
    echo   stop      停止服务
    echo   logs      查看日志
    echo   restart   重启服务
    echo   cleanup   清理 Docker 资源
    echo   backup    备份数据库
    echo   help      显示帮助信息
    echo.
    echo 环境:
    echo   dev       开发环境 (默认)
    echo   prod      生产环境
    echo   test      测试环境
    echo.
    echo 示例:
    echo   %0 deploy prod      # 部署生产环境
    echo   %0 logs backend     # 查看后端日志
    echo   %0 stop dev         # 停止开发环境
    exit /b 0

REM 主函数
:main
    set "command=%~1"
    set "env_type=%~2"
    
    if "%command%"=="" set "command=deploy"
    if "%env_type%"=="" set "env_type=dev"
    
    if "%command%"=="deploy" (
        call :check_dependencies
        call :load_env %env_type%
        
        if "%env_type%"=="dev" (
            call :deploy_dev
        ) else if "%env_type%"=="prod" (
            call :deploy_prod
        ) else if "%env_type%"=="test" (
            call :deploy_test
        ) else (
            call :print_error "未知环境类型: %env_type%"
            call :show_help
            exit /b 1
        )
    ) else if "%command%"=="stop" (
        call :stop_services %env_type%
    ) else if "%command%"=="logs" (
        call :view_logs %3 %env_type%
    ) else if "%command%"=="restart" (
        call :restart_services %env_type%
    ) else if "%command%"=="cleanup" (
        call :cleanup
    ) else if "%command%"=="backup" (
        call :backup_database
    ) else if "%command%"=="help" (
        call :show_help
    ) else (
        call :print_error "未知命令: %command%"
        call :show_help
        exit /b 1
    )
    exit /b 0

REM 执行主函数
call :main %*
endlocal