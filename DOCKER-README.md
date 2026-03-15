# OOPS-AI Docker 部署

本文档提供使用 Docker 快速部署 OOPS-AI 项目的指南。

## 快速开始

### 前提条件
1. 已安装 Docker 和 Docker Compose
2. 已安装 Git
3. 网络连接正常

### 步骤 1：克隆项目
```bash
git clone <repository-url>
cd oops-ai
```

### 步骤 2：配置环境变量
```bash
# 复制环境变量模板
copy .env.example .env

# 编辑 .env 文件，设置您的配置
# 至少需要设置一个 LLM API 密钥
```

### 步骤 3：启动开发环境
```powershell
# 使用 PowerShell 脚本
.\deploy.ps1 deploy dev

# 或直接使用 docker-compose
docker-compose -f docker-compose.dev.yml up -d
```

### 步骤 4：访问应用
- 🌐 **前端界面**: http://localhost:5173
- 🔧 **后端API**: http://localhost:3000
- 🗄️ **数据库管理**: localhost:5432
- 📊 **向量数据库**: localhost:8000

## 部署方式

### 1. 开发环境（推荐）
```powershell
# 启动开发环境
.\deploy.ps1 deploy dev

# 查看日志
.\deploy.ps1 logs backend dev
.\deploy.ps1 logs frontend dev

# 停止开发环境
.\deploy.ps1 stop dev
```

### 2. 生产环境
```powershell
# 启动生产环境
.\deploy.ps1 deploy prod

# 查看状态
docker-compose ps

# 停止生产环境
.\deploy.ps1 stop prod
```

### 3. 测试环境
```powershell
# 启动测试环境
.\deploy.ps1 deploy test

# 运行测试
docker-compose -f docker-compose.test.yml exec test-runner npm run test

# 停止测试环境
.\deploy.ps1 stop test
```

## 环境变量配置

### 必需配置
在 `.env` 文件中设置：

```bash
# 数据库配置
DATABASE_URL="postgresql://oops_user:oops_password@postgres:5432/oops_ai"

# 至少一个 LLM API 密钥
OPENAI_API_KEY="sk-xxx"  # 或
DEEPSEEK_API_KEY="sk-xxx"  # 或
QIANWEN_API_KEY="sk-xxx"

# JWT 密钥
JWT_SECRET="your-secure-jwt-secret"
```

### 可选配置
```bash
# Ollama 本地模型
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# 应用配置
PORT=3000
LOG_LEVEL="info"
```

## 服务说明

### 容器服务
| 服务 | 端口 | 说明 | 镜像 |
|------|------|------|------|
| 前端 | 5173 | Vue 开发服务器 | 自定义构建 |
| 后端 | 3000 | NestJS API 服务器 | 自定义构建 |
| 数据库 | 5432 | PostgreSQL | `zhcoder-docker-registry.com:8000/official/postgres:15-alpine` |
| 向量数据库 | 8000 | ChromaDB | `chromadb/chroma:latest` |
| Nginx | 80 | 反向代理（生产） | `nginx:alpine` |

### 数据持久化
- PostgreSQL 数据: `postgres_data` 卷
- ChromaDB 数据: `chromadb_data` 卷
- 备份目录: `backups/`

## 常用命令

### 部署管理
```powershell
# 查看所有服务状态
docker-compose ps

# 查看服务日志
.\deploy.ps1 logs <service> <env>

# 重启服务
.\deploy.ps1 restart <env>

# 清理资源
.\deploy.ps1 cleanup
```

### 数据库操作
```powershell
# 备份数据库
.\deploy.ps1 backup

# 进入数据库容器
docker-compose exec postgres psql -U oops_user -d oops_ai

# 运行数据库迁移
docker-compose exec backend npx prisma migrate dev
```

### 应用管理
```powershell
# 查看应用日志
docker-compose logs -f backend

# 重启单个服务
docker-compose restart backend

# 查看容器资源使用
docker stats
```

## 故障排除

### 常见问题

#### 1. 端口冲突
```powershell
# 查看端口占用
netstat -ano | findstr :5432

# 修改 docker-compose 中的端口映射
# 例如将 "5432:5432" 改为 "5433:5432"
```

#### 2. 镜像拉取失败
```powershell
# 检查网络连接
ping zhcoder-docker-registry.com

# 使用备用镜像
# 修改 docker-compose.yml 中的 image 字段
```

#### 3. 容器启动失败
```powershell
# 查看容器日志
docker-compose logs <service-name>

# 检查容器状态
docker-compose ps

# 重新构建容器
docker-compose up -d --build <service-name>
```

#### 4. 数据库连接失败
```powershell
# 检查数据库服务
docker-compose logs postgres

# 检查网络
docker network ls
docker network inspect oops-ai-network
```

### 日志查看
```powershell
# 实时查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend

# 查看最后100行日志
docker-compose logs --tail=100 backend

# 导出日志到文件
docker-compose logs > logs.txt
```

## 备份与恢复

### 数据库备份
```powershell
# 自动备份
.\deploy.ps1 backup

# 手动备份
docker-compose exec postgres pg_dump -U oops_user oops_ai > backup.sql
```

### 数据库恢复
```powershell
# 停止服务
.\deploy.ps1 stop prod

# 恢复数据库
docker-compose exec -T postgres psql -U oops_user -d oops_ai < backup.sql

# 启动服务
.\deploy.ps1 deploy prod
```

### 数据卷备份
```powershell
# 备份 PostgreSQL 数据卷
docker run --rm -v postgres_data:/source -v ${PWD}/backups:/backup alpine tar czf /backup/postgres_data.tar.gz -C /source .

# 恢复数据卷
docker run --rm -v postgres_data:/target -v ${PWD}/backups:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /target
```

## 监控与维护

### 健康检查
```powershell
# 检查后端健康
curl http://localhost:3000/health

# 检查数据库健康
docker-compose exec postgres pg_isready -U oops_user -d oops_ai
```

### 性能监控
```powershell
# 查看容器资源使用
docker stats

# 查看系统资源
docker system df

# 清理未使用的镜像
docker image prune -a
```

### 定期维护任务
1. **每日**: 检查服务状态
2. **每周**: 备份数据库
3. **每月**: 更新 Docker 镜像
4. **每季度**: 检查磁盘空间

## 高级配置

### 自定义配置
1. 修改 `docker-compose.yml` 调整服务配置
2. 修改 `nginx.conf` 调整反向代理设置
3. 修改 `Dockerfile` 调整构建过程

### 多环境部署
```powershell
# 开发环境
.\deploy.ps1 deploy dev

# 测试环境
.\deploy.ps1 deploy test

# 生产环境
.\deploy.ps1 deploy prod
```

### 扩展服务
```yaml
# 在 docker-compose.yml 中添加新服务
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

## 安全建议

### 生产环境部署
1. 使用强密码替换默认密码
2. 配置 SSL/TLS 证书
3. 设置防火墙规则
4. 启用访问日志
5. 定期更新镜像

### 环境变量安全
```bash
# 使用环境变量文件，不要硬编码密钥
# 在生产环境使用 secrets 管理
```

### 网络隔离
```yaml
# 使用自定义网络
networks:
  oops-ai-network:
    driver: bridge
    internal: true  # 内部网络，不对外暴露
```

## 支持与帮助

### 获取帮助
```powershell
# 查看部署脚本帮助
.\deploy.ps1 help

# 查看 Docker 帮助
docker --help
docker-compose --help
```

### 问题反馈
遇到问题时，请提供：
1. Docker 版本：`docker --version`
2. 操作系统信息
3. 错误日志：`docker-compose logs`
4. 环境配置（隐藏敏感信息）

### 更新部署
```powershell
# 拉取最新代码
git pull

# 重建服务
docker-compose down
docker-compose up -d --build

# 运行数据库迁移
docker-compose exec backend npx prisma migrate deploy
```

---

## 下一步

1. ✅ 配置环境变量
2. ✅ 启动开发环境
3. 🔄 测试应用功能
4. ⏳ 配置生产环境
5. ⏳ 设置监控告警
6. ⏳ 配置备份策略

如需更多帮助，请参考 [DEPLOYMENT.md](DEPLOYMENT.md) 或联系项目维护者。