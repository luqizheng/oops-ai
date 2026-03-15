# 使用 Node.js 官方镜像作为基础镜像
FROM  zhcoder-docker-registry.com:8000/official/node:20-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 复制前端和后端的 package.json 文件
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制所有源代码
COPY . .

# 构建阶段 - 前端
FROM base AS frontend-builder
WORKDIR /app/frontend
RUN pnpm run build

# 构建阶段 - 后端
FROM base AS backend-builder
WORKDIR /app/backend
RUN pnpm run build

# 生产阶段
FROM node:20-alpine AS production

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# 安装生产依赖（不包括 devDependencies）
RUN pnpm install --frozen-lockfile --prod

# 从前端构建阶段复制构建结果
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 从后端构建阶段复制构建结果
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# 复制必要的配置文件
COPY backend/.env.example ./backend/.env

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && node dist/main.js"]