# OOPS-AI 部署指南

本文档提供 OOPS-AI 项目的 Docker 部署说明。

## 目录

1. [系统要求](#系统要求)
2. [快速开始](#快速开始)
3. [环境配置](#环境配置)
4. [部署方式](#部署方式)
5. [服务管理](#服务管理)
6. [故障排除](#故障排除)
7. [备份与恢复](#备份与恢复)

## 系统要求

### 硬件要求
- CPU: 2核以上
- 内存: 4GB以上
- 磁盘空间: 10GB以上

### 软件要求
- Docker: 20.10+
- Docker Compose: 2.0+
- Git: 2.20+

### 网络要求
- 开放端口: 80, 443, 3000, 5173, 5432
- 互联网访问（用于下载 LLM 模型）

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd oops-ai
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置您的配置
```

### 3. 启动开发环境
```bash
# 方法一：使用部署脚本
chmod +x deploy.sh
./deploy.sh deploy dev

# 方法二：直接使用 docker-compose
docker-compose -f docker-compose.dev.yml up -d
```

### 4. 访问应用
- 前端: http://localhost:5173
- 后端API: http://localhost:3000
- 数据库: localhost:5432

## 环境配置

### 必需的环境变量

在 `.env` 文件中配置以下变量：

```bash
# 数据库配置
DATABASE_URL="postgresql://oops_user:oops_password@postgres:5432/oops_ai"

# 至少配置一个 LLM API 密钥
OPENAI_API_KEY="sk-xxx"
# 或
DEEPSEEK_API_KEY="sk-xxx"
# 或
QIANWEN_API_KEY="sk-xxx"

# JWT 密钥
JWT_SECRET="your-secure-jwt-secret"
```

### 可选的环境变量

```bash
# Ollama 配置（本地模型）
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# 向量数据库
CHROMADB_HOST="chromadb"
CHROMADB_PORT=8000

# 应用配置
PORT=3000
LOG_LEVEL="info"
```

## 部署方式

### 开发环境部署

开发环境支持热重载和调试。

```bash
# 启动开发环境
./deploy.sh deploy dev

# 查看日志
./deploy.sh logs backend dev
./deploy.sh logs frontend dev

# 停止开发环境
./deploy.sh stop dev
```

### 生产环境部署

生产环境使用优化配置。

```bash
# 启动生产环境
./deploy.sh deploy prod

# 查看状态
docker-compose ps

# 停止生产环境
./deploy.sh stop prod
```

### 测试环境部署

```bash
# 启动测试环境
./deploy.sh deploy test

# 运行测试
docker-compose -f docker-compose.test.yml exec test-runner npm run test

# 停止测试环境
./deploy.sh stop test
```

## 服务管理

### 常用命令

```bash
# 查看所有服务状态
docker-compose ps

# 查看服务日志
./deploy.sh logs <service> <env>
# 示例：查看后端开发环境日志
./deploy.sh logs backend dev

# 重启服务
./deploy.sh restart <env>
# 示例：重启开发环境
./deploy.sh restart dev

# 清理 Docker 资源
./deploy.sh cleanup
```

### 服务端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 5173 | Vue 开发服务器 |
| 后端 | 3000 | NestJS API 服务器 |
| 数据库 | 5432 | PostgreSQL |
| 向量数据库 | 8000 | ChromaDB |
| Nginx | 80 | 生产环境反向代理 |

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库服务状态
docker-compose logs postgres

# 检查网络连接
docker network ls
docker network inspect oops-ai-network
```

#### 2. 端口冲突
```bash
# 查看端口占用
netstat -tulpn | grep :5432

# 修改 docker-compose 中的端口映射
# 例如将 5432:5432 改为 5433:5432
```

#### 3. 内存不足
```bash
# 查看 Docker 资源使用情况
docker stats

# 限制容器内存使用
# 在 docker-compose.yml 中添加：
# deploy:
#   resources:
#     limits:
#       memory: 1G
```

#### 4. 镜像拉取失败
```bash
# 检查网络连接
ping zhcoderd-docker-registry.com

# 使用备用镜像
# 修改 docker-compose.yml 中的 image 字段
```

### 日志查看

```bash
# 查看所有服务的日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f backend

# 查看最后100行日志
docker-compose logs --tail=100 backend

# 查看错误日志
docker-compose logs backend | grep -i error
```

## 备份与恢复

### 数据库备份

```bash
# 手动备份
./deploy.sh backup

# 备份文件保存在 backups/ 目录
# 格式：backup_YYYYMMDD_HHMMSS.sql
```

### 数据库恢复

```bash
# 停止服务
./deploy.sh stop prod

# 恢复数据库
docker-compose exec postgres psql -U oops_user -d oops_ai < backup_file.sql

# 启动服务
./deploy.sh deploy prod
```

### 数据卷备份

```bash
# 备份 PostgreSQL 数据卷
docker run --rm -v postgres_data:/source -v $(pwd)/backups:/backup alpine \
  tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /source .

# 备份 ChromaDB 数据卷
docker run --rm -v chromadb_data:/source -v $(pwd)/backups:/backup alpine \
  tar czf /backup/chromadb_data_$(date +%Y%m%d).tar.gz -C /source .
```

### 数据卷恢复

```bash
# 恢复 PostgreSQL 数据卷
docker run --rm -v postgres_data:/target -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/postgres_data_20240101.tar.gz -C /target

# 恢复 ChromaDB 数据卷
docker run --rm -v chromadb_data:/target -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/chromadb_data_20240101.tar.gz -C /target
```

## 监控与维护

### 健康检查

```bash
# 检查后端健康状态
curl http://localhost:3000/health

# 检查数据库健康状态
docker-compose exec postgres pg_isready -U oops_user -d oops_ai
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看容器日志大小
docker logs --tail=0 --follow=false backend | wc -l

# 清理旧日志
docker-compose logs --tail=1000 > logs_backup.log
echo "" > $(docker inspect --format='{{.LogPath}}' oops-ai-backend)
```

### 定期维护

1. **每周**：备份数据库
2. **每月**：更新 Docker 镜像
3. **每季度**：检查磁盘空间
4. **每年**：更新 SSL 证书（如果使用 HTTPS）

## 高级配置

### 自定义 Nginx 配置

编辑 `nginx.conf` 文件：

```nginx
# 添加 SSL 配置
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... 其他配置
}
```

### 负载均衡配置

```yaml
# 在 docker-compose.yml 中添加
backend:
  deploy:
    replicas: 3
    resources:
      limits:
        memory: 512M
    restart_policy:
      condition: on-failure
```

### 持久化存储

确保数据卷正确挂载：

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      device: /data/postgres
      o: bind
```

## 支持与帮助

### 获取帮助

```bash
# 查看部署脚本帮助
./deploy.sh help

# 查看 Docker Compose 帮助
docker-compose --help
```

### 问题反馈

遇到问题时，请提供以下信息：

1. Docker 版本：`docker --version`
2. Docker Compose 版本：`docker-compose --version`
3. 操作系统：`uname -a`
4. 错误日志：`docker-compose logs`
5. 环境配置：`.env` 文件（隐藏敏感信息）

### 更新部署配置

当项目更新时：

```bash
# 拉取最新代码
git pull

# 重建并重启服务
docker-compose down
docker-compose up -d --build

# 运行数据库迁移
docker-compose exec backend npx prisma migrate deploy
```

---

**注意**：生产环境部署前，请确保：
1. 已配置正确的环境变量
2. 已设置防火墙规则
3. 已配置域名和 SSL 证书
4. 已进行安全审计
5. 已设置监控和告警