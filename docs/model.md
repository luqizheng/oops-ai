---
alwaysApply: false
---
# 数据模型论述

## 系统基本功能

### 1. 用户（User）
- **定义**：系统的使用者，拥有唯一身份标识和访问权限。
- **属性**：
  - `id`: 唯一标识符
  - `email`: 电子邮箱（登录凭证）
  - `password`: 密码（加密存储）
  - `name`: 用户名（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
  - `roleId`: 角色ID（外键，关联Role）
- **关系**：
  - 一个用户属于一个角色
  - 一个用户可以是多个项目的成员
  - 一个用户可以创建/分配多个需求

### 2. 角色（Role）
- **定义**：系统级别的权限集合，用于控制用户的系统操作权限。
- **属性**：
  - `id`: 唯一标识符
  - `name`: 角色名称
  - `description`: 角色描述（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个角色可以拥有多个用户
  - 一个角色可以包含多个权限

### 3. 权限（Permission）
- **定义**：系统级别的操作许可，控制用户可以执行的具体功能。
- **属性**：
  - `id`: 唯一标识符
  - `name`: 权限名称
  - `description`: 权限描述（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
  - `roleId`: 角色ID（外键，关联Role）
- **关系**：
  - 一个权限属于一个角色
  - 一个角色可以包含多个权限

## AI 配置

（待详细设计）

## 项目

### 1. 项目（Project）
- **定义**：一个独立的软件产品或服务，由多个团队成员合作开发，包含多个需求。
- **属性**：
  - `id`: 唯一标识符
  - `name`: 项目名称
  - `description`: 项目描述（可选）
  - `key`: 项目标识键（用于生成需求ID）
  - `settings`: 项目设置（JSON格式）
  - `status`: 项目状态
  - `createdBy`: 创建者ID（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个项目可以有多个项目成员
  - 一个项目可以有多个需求
  - 一个项目可以有一个项目设置

### 2. 项目成员（ProjectMember）
- **定义**：参与项目开发的人员，在项目中拥有特定角色和权限。
- **属性**：
  - `projectId`: 项目ID（外键，关联Project）
  - `userId`: 用户ID（外键，关联User）
  - `role`: 项目角色（如项目经理、开发人员、测试人员等）
  - `permissions`: 项目权限（JSON格式）
  - `joinedAt`: 加入时间
- **关系**：
  - 一个项目成员属于一个项目
  - 一个项目成员对应一个用户
  - 一个项目可以有多个项目成员

### 3. 项目设置（ProjectSettings）
- **定义**：项目的配置信息，包括工作流、通知等设置。
- **属性**：
  - `projectId`: 项目ID（外键，关联Project）
  - `workflowConfig`: 工作流配置（JSON格式）
  - `notificationConfig`: 通知配置（JSON格式）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个项目设置属于一个项目
  - 一个项目只有一个项目设置

## 需求相关

需求都与项目相关，一个项目可以有多个需求，每个需求都是对项目的功能或服务的描述。

### 1. 原始需求（Raw Requirement）
- **定义**：用户直接提出的需求，未经过分析或处理。
- **属性**：
  - `id`: 唯一标识符
  - `content`: 需求内容
  - `sourceType`: 需求来源类型
  - `sourceMeta`: 需求来源元数据（JSON格式，可选）
  - `proposedBy`: 提出者ID（可选）
  - `proposedAt`: 提出时间
  - `scenario`: 使用场景（可选）
  - `projectId`: 项目ID（外键，关联Project）
  - `contactPerson`: 联系人（可选）
  - `contactInfo`: 联系方式（可选）
  - `attachments`: 附件列表（包含文件名、路径、类型、大小等信息）
  - `createdAt`: 创建时间
- **关系**：
  - 一个原始需求属于一个项目
  - 一个原始需求可以衍生出多个需求
  - 一个原始需求可以包含多个附件

### 2. 附件（Attachment）
- **定义**：与原始需求相关联的文件附件。
- **属性**：
  - `id`: 唯一标识符
  - `fileName`: 文件名
  - `filePath`: 文件路径
  - `fileType`: 文件类型
  - `fileSize`: 文件大小（字节）
  - `uploadedBy`: 上传者ID（可选）
  - `uploadedAt`: 上传时间
- **关系**：
  - 一个附件属于一个原始需求
  - 一个原始需求可以包含多个附件

### 3. 需求（Requirement）
- **定义**：经过分析和处理的需求，用于系统功能的实现，包含完整的属性和状态。
- **状态枚举**：
  - `DRAFT`: 草稿
  - `SUBMITTED`: 已提交
  - `REVIEWING`: 审核中
  - `APPROVED`: 已批准
  - `REJECTED`: 已拒绝
  - `IMPLEMENTING`: 实现中
  - `TESTING`: 测试中
  - `COMPLETED`: 已完成
  - `CANCELED`: 已取消
- **优先级枚举**：
  - `LOW`: 低
  - `MEDIUM`: 中
  - `HIGH`: 高
  - `URGENT`: 紧急
- **类型枚举**：
  - `FEATURE`: 功能需求
  - `BUGFIX`: 缺陷修复
  - `ENHANCEMENT`: 功能增强
  - `TASK`: 任务
  - `NON_FUNCTIONAL`: 非功能需求
- **属性**：
  - `id`: 唯一标识符
  - `projectId`: 项目ID（外键，关联Project）
  - `rawRequirementId`: 原始需求ID（可选）
  - `title`: 需求标题
  - `description`: 需求描述（可选）
  - `status`: 需求状态
  - `priority`: 需求优先级
  - `type`: 需求类型
  - `storyPoints`: 故事点数（可选）
  - `rawInput`: 原始输入（可选）
  - `structuredData`: 结构化数据（JSON格式，可选）
  - `qualityScore`: 质量评分（可选）
  - `vectorEmbedding`: 向量嵌入（可选）
  - `assigneeId`: 负责人ID（可选）
  - `reporterId`: 报告人ID
  - `dueDate`: 截止日期（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个需求属于一个项目
  - 一个需求可以关联一个原始需求
  - 一个需求可以有多个用户故事
  - 一个需求可以有多个验收标准
  - 一个需求可以有多个测试用例
  - 一个需求可以有多个业务规则
  - 一个需求可以有多个非功能需求
  - 一个需求可以有多个依赖关系
  - 一个需求可以有多个验收签名

### 4. 用户故事（User Story）
- **定义**：从用户的角度描述系统功能的一种方式，通常包含角色、需求和收益。
- **属性**：
  - `id`: 唯一标识符
  - `requirementId`: 需求ID（外键，关联Requirement）
  - `role`: 用户角色
  - `want`: 需要的功能
  - `soThat`: 收益原因（可选）
  - `acceptanceNotes`: 验收说明（可选）
  - `storyPoints`: 故事点数（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个用户故事属于一个需求
  - 一个需求可以有多个用户故事

### 5. 验收标准（Acceptance Criteria）
- **定义**：用于验证系统是否满足需求的标准，采用Given-When-Then格式描述。
- **状态枚举**：
  - `NOT_TESTED`: 未测试
  - `PASS`: 通过
  - `FAIL`: 失败
  - `BLOCKED`: 阻塞
  - `IN_PROGRESS`: 进行中
- **属性**：
  - `id`: 唯一标识符
  - `requirementId`: 需求ID（外键，关联Requirement）
  - `scenario`: 场景名称
  - `given`: 前置条件（数组）
  - `when`: 触发条件
  - `then`: 预期结果（数组）
  - `and`: 附加条件（数组，可选）
  - `scenarioType`: 场景类型
  - `status`: 验收状态
  - `testedById`: 测试人ID（可选）
  - `testedAt`: 测试时间（可选）
  - `testEvidence`: 测试证据（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个验收标准属于一个需求
  - 一个需求可以有多个验收标准
  - 一个验收标准可以关联多个测试用例

### 6. 测试用例（TestCase）
- **定义**：用于验证系统是否满足验收标准的具体测试用例，包含测试步骤和预期结果。
- **自动化状态枚举**：
  - `MANUAL`: 手动
  - `AUTOMATED`: 自动化
  - `PARTIALLY_AUTOMATED`: 部分自动化
  - `NOT_AUTOMATABLE`: 不可自动化
- **运行状态枚举**：
  - `PASS`: 通过
  - `FAIL`: 失败
  - `BLOCKED`: 阻塞
  - `SKIPPED`: 跳过
  - `IN_PROGRESS`: 进行中
- **属性**：
  - `id`: 唯一标识符
  - `requirementId`: 需求ID（外键，关联Requirement）
  - `acceptanceCriteriaId`: 验收标准ID（可选）
  - `title`: 测试用例标题
  - `description`: 测试用例描述（可选）
  - `preconditions`: 前置条件（数组）
  - `testSteps`: 测试步骤（包含step、data、expected字段的数组）
  - `testData`: 测试数据（JSON格式，可选）
  - `automationStatus`: 自动化状态
  - `automationScript`: 自动化脚本（可选）
  - `automationFramework`: 自动化框架（可选）
  - `lastRunStatus`: 最后运行状态（可选）
  - `lastRunAt`: 最后运行时间（可选）
  - `lastRunById`: 最后运行人ID（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个测试用例属于一个需求
  - 一个测试用例可以关联一个验收标准
  - 一个需求可以有多个测试用例

### 7. 业务规则（Business Rule）
- **定义**：用于描述系统行为的规则，包含条件、操作和优先级。
- **属性**：
  - `id`: 唯一标识符
  - `requirementId`: 需求ID（外键，关联Requirement）
  - `ruleId`: 规则ID
  - `ruleName`: 规则名称
  - `ruleType`: 规则类型
  - `ruleExpression`: 规则表达式
  - `ruleDescription`: 规则描述
  - `condition`: 条件（可选）
  - `action`: 操作（可选）
  - `elseAction`: 否则操作（可选）
  - `effectiveFrom`: 生效时间（可选）
  - `effectiveTo`: 失效时间（可选）
  - `priority`: 优先级
  - `affectedModules`: 影响模块（数组，可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个业务规则属于一个需求
  - 一个需求可以有多个业务规则

### 8. 非功能需求（NFRRequirement）
- **定义**：用于描述系统性能、安全、可维护性等方面的需求，包含度量标准和目标值。
- **验证状态枚举**：
  - `NOT_VERIFIED`: 未验证
  - `PASSED`: 通过
  - `WARNING`: 警告
  - `FAILED`: 失败
  - `IN_PROGRESS`: 进行中
- **属性**：
  - `id`: 唯一标识符
  - `requirementId`: 需求ID（外键，关联Requirement）
  - `nfrType`: NFR类型（如性能、安全、可用性等）
  - `metric`: 度量指标
  - `targetValue`: 目标值
  - `unit`: 单位
  - `comparison`: 比较运算符
  - `warningThreshold`: 警告阈值（可选）
  - `criticalThreshold`: 严重阈值（可选）
  - `measurementMethod`: 测量方法（可选）
  - `measurementTool`: 测量工具（可选）
  - `verificationStatus`: 验证状态
  - `lastVerifiedAt`: 最后验证时间（可选）
  - `lastVerifiedValue`: 最后验证值（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个非功能需求属于一个需求
  - 一个需求可以有多个非功能需求

### 9. 依赖关系（RequirementDependency）
- **定义**：用于描述需求之间的依赖关系，包含依赖类型和强度。
- **属性**：
  - `id`: 唯一标识符
  - `requirementId`: 需求ID（外键，关联Requirement）
  - `dependsOnId`: 依赖的需求ID（外键，关联Requirement）
  - `dependencyType`: 依赖类型
  - `description`: 依赖描述（可选）
  - `strength`: 依赖强度（数值）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个依赖关系属于一个需求
  - 一个需求可以有多个依赖关系
  - 一个依赖关系指向另一个需求

### 10. 验收签名（AcceptanceSignoff）
- **定义**：用于记录需求验收的签名信息，包含签名状态和证据。
- **签名状态枚举**：
  - `PENDING`: 待签名
  - `APPROVED`: 已批准
  - `REJECTED`: 已拒绝
  - `CONDITIONAL`: 有条件批准
- **属性**：
  - `id`: 唯一标识符
  - `requirementId`: 需求ID（外键，关联Requirement）
  - `signoffType`: 签名类型
  - `signoffStatus`: 签名状态
  - `signedById`: 签名人ID（可选）
  - `signedAt`: 签名时间（可选）
  - `signoffEvidence`: 签名证据（可选）
  - `comments`: 评论（可选）
  - `criteriaIds`: 关联的验收标准ID（数组，可选）
  - `milestone`: 里程碑（可选）
  - `releaseVersion`: 发布版本（可选）
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
- **关系**：
  - 一个验收签名属于一个需求
  - 一个需求可以有多个验收签名


