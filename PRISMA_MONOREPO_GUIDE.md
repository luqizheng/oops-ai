# Prisma Monorepo 最佳实践指南

## 目录结构

```
oops-ai/
├── backend/             # 后端应用
├── frontend/            # 前端应用
├── shared/              # 共享模块
│   ├── src/
│   │   ├── dtos/        # 数据传输对象
│   │   ├── models/      # 数据模型
│   │   ├── generated/   # 自动生成的文件
│   │   │   └── prisma-client/  # Prisma 客户端
│   │   └── index.ts     # 导出所有共享内容
│   ├── schema.prisma    # Prisma 数据模型定义
│   └── package.json     # 共享模块配置
└── package.json         # 根项目配置
```

## 核心配置

### 1. Shared 模块配置

- `schema.prisma` 位于 shared 模块根目录
- 使用 `output = "./src/generated/prisma-client"` 配置 Prisma 客户端输出位置
- 在 `package.json` 中添加 `prisma` 配置指定 schema 文件位置

### 2. 导入路径

#### 在 Backend 中使用：

```typescript
// 导入 PrismaClient
import { PrismaClient } from '@oops-ai/shared';

// 导入 Prisma 类型
import type { Prisma } from '@oops-ai/shared';
```

#### 在 Frontend 中使用：

```typescript
// 导入 Prisma 类型（仅类型导入）
import type { Prisma } from '@oops-ai/shared';
```

## 脚本命令

### 根目录脚本

```bash
# 生成 Prisma 客户端
pnpm prisma:generate

# 运行数据库迁移
pnpm prisma:migrate
```

### Shared 模块脚本

```bash
# 生成 Prisma 客户端
pnpm generate
```

### Backend 模块脚本

```bash
# 运行数据库迁移
pnpm prisma:migrate

# 打开 Prisma Studio
pnpm prisma:studio
```

## 最佳实践

1. **集中管理数据模型**：所有数据库模型定义都在 `shared/schema.prisma` 中
2. **共享 Prisma 客户端**：避免在多个模块中重复生成客户端
3. **类型安全**：前后端共享相同的类型定义，确保数据一致性
4. **明确职责**：
   - Shared：数据模型、类型定义、Prisma 客户端
   - Backend：业务逻辑、API 接口
   - Frontend：用户界面、API 调用

## 迁移步骤

1. 将旧的 `schema.prisma` 文件移动到 `shared/` 目录
2. 更新 `generator client` 的 `output` 配置
3. 更新所有导入路径从 `@oops-ai/shared/src/generated/prisma-client` 到 `@oops-ai/shared`
4. 运行 `pnpm prisma:generate` 重新生成客户端
5. 运行 `pnpm prisma:migrate` 确保迁移正常工作

## 注意事项

- 确保 `@oops-ai/shared` 包在 `backend` 和 `frontend` 包的 `dependencies` 中
- 只在 `shared` 模块中安装 `prisma` 作为开发依赖
- 所有模块都应该使用 `@oops-ai/shared` 包提供的 Prisma 类型
