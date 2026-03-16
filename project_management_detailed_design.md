# 项目管理模块详细设计

## 1. 概述

项目管理模块是Oops-AI需求管理系统的核心组成部分，用于支持用户以个人或组织形式创建和管理项目，并在项目中管理需求。本设计基于系统架构文档和MVP技术实现文档，详细描述项目管理模块的数据库设计、API接口、前端组件和业务逻辑。

## 2. 数据库模型设计

### 2.1 项目表（projects）

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    key VARCHAR(50) UNIQUE NOT NULL, -- 项目标识符，如 "PROJ-001"
    settings JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 项目成员表（project_members）

```sql
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'developer', -- product_manager, developer, tester, project_manager, viewer
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);
```

### 2.3 项目设置表（project_settings）

```sql
CREATE TABLE project_settings (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    workflow_config JSONB DEFAULT '{
        "states": ["draft", "reviewing", "approved", "developing", "testing", "done"],
        "transitions": [
            {"from": "draft", "to": "reviewing", "roles": ["product_manager", "project_manager"]},
            {"from": "reviewing", "to": "approved", "roles": ["product_manager", "project_manager", "developer"]},
            {"from": "approved", "to": "developing", "roles": ["project_manager", "developer"]},
            {"from": "developing", "to": "testing", "roles": ["developer"]},
            {"from": "testing", "to": "done", "roles": ["tester", "project_manager"]}
        ]
    }',
    notification_config JSONB DEFAULT '{
        "email_notifications": true,
        "in_app_notifications": true,
        "slack_integration": false,
        "mention_notifications": true
    }',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.4 更新需求表关联项目

```sql
ALTER TABLE requirements ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE requirements ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE requirements ADD COLUMN priority VARCHAR(50) DEFAULT 'medium';
ALTER TABLE requirements ADD COLUMN story_points INT;
ALTER TABLE requirements ADD COLUMN assignee_id UUID REFERENCES users(id);
ALTER TABLE requirements ADD COLUMN reporter_id UUID REFERENCES users(id) NOT NULL;
ALTER TABLE requirements ADD COLUMN due_date TIMESTAMP;
```

### 2.5 Prisma Schema 定义

在 `backend/prisma/schema.prisma` 中添加以下模型：

```prisma
model Project {
  id             String           @id @default(uuid())
  organizationId String?          @map("organization_id")
  name           String
  description    String?
  key            String           @unique
  settings       Json             @default("{}")
  status         String           @default("active")
  createdBy      String?          @map("created_by")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @default(now()) @updatedAt @map("updated_at")
  organization   Organization?    @relation(fields: [organizationId], references: [id])
  members        ProjectMember[]
  projectSettings ProjectSettings?
  requirements   Requirement[]

  @@map("projects")
}

model ProjectMember {
  projectId  String   @map("project_id")
  userId     String   @map("user_id")
  role       String   @default("developer")
  permissions Json    @default("{}")
  joinedAt   DateTime @default(now()) @map("joined_at")
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([projectId, userId])
  @@map("project_members")
}

model ProjectSettings {
  projectId         String  @map("project_id")
  workflowConfig    Json    @default("{\"states\": [\"draft\", \"reviewing\", \"approved\", \"developing\", \"testing\", \"done\"], \"transitions\": [{\"from\": \"draft\", \"to\": \"reviewing\", \"roles\": [\"product_manager\", \"project_manager\"]}, {\"from\": \"reviewing\", \"to\": \"approved\", \"roles\": [\"product_manager\", \"project_manager\", \"developer\"]}, {\"from\": \"approved\", \"to\": \"developing\", \"roles\": [\"project_manager\", \"developer\"]}, {\"from\": \"developing\", \"to\": \"testing\", \"roles\": [\"developer\"]}, {\"from\": \"testing\", \"to\": \"done\", \"roles\": [\"tester\", \"project_manager\"]}]}") @map("workflow_config