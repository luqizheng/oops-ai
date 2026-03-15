#!/bin/bash

# OOPS-AI 部署脚本
# 使用方法: ./deploy.sh [dev|prod|test]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 环境变量文件
ENV_FILE=".env"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 和 Docker Compose
check_dependencies() {
    print_info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_success "依赖检查通过"
}

# 加载环境变量
load_env() {
    local env_type=$1
    
    if [ -f "$ENV_FILE.$env_type" ]; then
        print_info "加载 $ENV_FILE.$env_type 环境变量"
        source "$ENV_FILE.$env_type"
    elif [ -f "$ENV_FILE" ]; then
        print_info "加载 $ENV_FILE 环境变量"
        source "$ENV_FILE"
    else
        print_warning "未找到环境变量文件，使用默认值"
    fi
}

# 开发环境部署
deploy_dev() {
    print_info "开始开发环境部署..."
    
    # 构建并启动服务
    docker-compose -f docker-compose.dev.yml up -d --build
    
    # 等待服务启动
    sleep 10
    
    # 运行数据库迁移
    print_info "运行数据库迁移..."
    docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
    
    print_success "开发环境部署完成"
    print_info "前端访问: http://localhost:5173"
    print_info "后端API: http://localhost:3000"
    print_info "数据库: localhost:5432"
}

# 生产环境部署
deploy_prod() {
    print_info "开始生产环境部署..."
    
    # 检查必要的环境变量
    if [ -z "$OPENAI_API_KEY" ] && [ -z "$DEEPSEEK_API_KEY" ] && [ -z "$QIANWEN_API_KEY" ]; then
        print_warning "未设置任何 LLM API 密钥，部分功能可能无法使用"
    fi
    
    # 构建并启动服务
    docker-compose -f docker-compose.yml up -d --build
    
    # 等待服务启动
    sleep 15
    
    # 运行数据库迁移
    print_info "运行数据库迁移..."
    docker-compose exec backend npx prisma migrate deploy
    
    print_success "生产环境部署完成"
    print_info "应用访问: http://localhost"
    print_info "API访问: http://localhost/api"
    print_info "数据库: localhost:5432"
}

# 测试环境部署
deploy_test() {
    print_info "开始测试环境部署..."
    
    # 构建并启动服务
    docker-compose -f docker-compose.test.yml up -d --build
    
    # 等待服务启动
    sleep 10
    
    print_success "测试环境部署完成"
    print_info "前端访问: http://localhost:4173"
    print_info "后端API: http://localhost:3001"
}

# 停止服务
stop_services() {
    local env_type=$1
    
    case $env_type in
        dev)
            docker-compose -f docker-compose.dev.yml down
            ;;
        prod)
            docker-compose down
            ;;
        test)
            docker-compose -f docker-compose.test.yml down
            ;;
        *)
            docker-compose down
            ;;
    esac
    
    print_success "服务已停止"
}

# 查看日志
view_logs() {
    local service=$1
    local env_type=$2
    
    case $env_type in
        dev)
            docker-compose -f docker-compose.dev.yml logs -f $service
            ;;
        prod)
            docker-compose logs -f $service
            ;;
        test)
            docker-compose -f docker-compose.test.yml logs -f $service
            ;;
        *)
            docker-compose logs -f $service
            ;;
    esac
}

# 重启服务
restart_services() {
    local env_type=$1
    
    case $env_type in
        dev)
            docker-compose -f docker-compose.dev.yml restart
            ;;
        prod)
            docker-compose restart
            ;;
        test)
            docker-compose -f docker-compose.test.yml restart
            ;;
        *)
            docker-compose restart
            ;;
    esac
    
    print_success "服务已重启"
}

# 清理资源
cleanup() {
    print_info "清理未使用的 Docker 资源..."
    
    docker system prune -f
    docker volume prune -f
    
    print_success "清理完成"
}

# 备份数据库
backup_database() {
    local backup_dir="backups"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$backup_dir/backup_$timestamp.sql"
    
    mkdir -p "$backup_dir"
    
    print_info "备份数据库到 $backup_file"
    
    docker-compose exec postgres pg_dump -U oops_user oops_ai > "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "数据库备份成功: $backup_file"
    else
        print_error "数据库备份失败"
    fi
}

# 显示帮助信息
show_help() {
    echo "OOPS-AI 部署脚本"
    echo ""
    echo "使用方法: $0 [命令] [环境]"
    echo ""
    echo "命令:"
    echo "  deploy    部署服务 (默认命令)"
    echo "  stop      停止服务"
    echo "  logs      查看日志"
    echo "  restart   重启服务"
    echo "  cleanup   清理 Docker 资源"
    echo "  backup    备份数据库"
    echo "  help      显示帮助信息"
    echo ""
    echo "环境:"
    echo "  dev       开发环境 (默认)"
    echo "  prod      生产环境"
    echo "  test      测试环境"
    echo ""
    echo "示例:"
    echo "  $0 deploy prod      # 部署生产环境"
    echo "  $0 logs backend     # 查看后端日志"
    echo "  $0 stop dev         # 停止开发环境"
}

# 主函数
main() {
    local command=${1:-"deploy"}
    local env_type=${2:-"dev"}
    
    case $command in
        deploy)
            check_dependencies
            load_env $env_type
            
            case $env_type in
                dev)
                    deploy_dev
                    ;;
                prod)
                    deploy_prod
                    ;;
                test)
                    deploy_test
                    ;;
                *)
                    print_error "未知环境类型: $env_type"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
        stop)
            stop_services $env_type
            ;;
        logs)
            view_logs $3 $env_type
            ;;
        restart)
            restart_services $env_type
            ;;
        cleanup)
            cleanup
            ;;
        backup)
            backup_database
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"