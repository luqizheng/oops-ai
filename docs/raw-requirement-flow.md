# 多轮对话式需求分析 API 设计

场景：原始需求创建
这是一个多轮对话交互的场景，核心是保持会话上下文，让 AI 能够基于之前的分析结果和用户回答，进行迭代式的需求细化。

## 一、整体流程设计

```txt
┌─────────────────────────────────────────────────────────────────┐
│                        多轮需求分析流程                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  第1轮: 用户提交原始需求                                          │
│      ↓                                                           │
│  API: POST /api/requirement/analyze                             │
│      ↓                                                           │
│  返回: 需求列表 + 澄清问题                                         │
│      ↓                                                           │
│  用户回答问题                                                    │
│      ↓                                                           │
│  第2轮: 提交回答 + 会话ID                                         │
│      ↓                                                           │
│  API: POST /api/requirement/analyze (带会话上下文)                │
│      ↓                                                           │
│  返回: 更新后的需求 + 新的澄清问题                                  │
│      ↓                                                           │
│  循环直到问题清空                                                  │
│      ↓                                                           │
│  最终: 确认后的结构化需求                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

```

## 二、数据模型设计

```typescript
// types/requirement-analysis.ts

// 会话上下文
interface AnalysisSession {
  sessionId: string; // 会话唯一标识
  rawContent: string; // 原始需求内容
  currentRequirements: StructuredRequirement[]; // 当前需求列表
  pendingQuestions: ClarifyingQuestion[]; // 待澄清问题
  answeredQuestions: AnsweredQuestion[]; // 已回答的问题
  status: "analyzing" | "waiting_for_answers" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

// 结构化需求
interface StructuredRequirement {
  id: string; // 临时ID，前端生成
  title: string;
  type: "FUNCTIONAL" | "NFR" | "SECURITY" | "UI_UX" | "PERFORMANCE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  acceptanceCriteria: string[];
  notes?: string;
  status: "draft" | "confirmed" | "merged" | "deleted";
}

// 澄清问题
interface ClarifyingQuestion {
  id: string;
  question: string;
  relatedRequirementIds: string[]; // 关联的需求ID
  answerType: "text" | "number" | "select" | "boolean";
  options?: string[]; // 如果是select类型
  answer?: string; // 用户回答后填充
}

// 已回答的问题
interface AnsweredQuestion {
  questionId: string;
  question: string;
  answer: string;
  answeredAt: Date;
}
```

## 三、API 设计

```typescript
// 首次分析 - 提交原始需求
POST /api/ai-requirement/analyze
Request:
{
  "rawContent": "我们希望系统登录体验更好，要快一点，还要安全...",
  "projectId": "proj_001",      // 可选，用于获取项目上下文
  "existingRequirements": []     // 可选，已有需求避免重复
}

Response:
{
  "sessionId": "sess_abc123",
  "requirements": [...],          // 初步拆解的需求列表
  "pendingQuestions": [...],      // 需要澄清的问题
  "status": "waiting_for_answers"
}

// 后续分析 - 提交问题回答
POST /api/ai-requirement/analyze
Request:
{
  "sessionId": "sess_abc123",
  "answers": [
    {
      "questionId": "q_001",
      "answer": "2秒以内"
    },
    {
      "questionId": "q_002",
      "answer": "支持微信和手机号两种方式"
    }
  ],
  "confirmedRequirements": ["req_001", "req_002"]  // 用户确认的需求ID
}

Response:
{
  "sessionId": "sess_abc123",
  "requirements": [...],          // 更新后的需求列表
  "pendingQuestions": [...],      // 剩余的/新的澄清问题
  "status": "waiting_for_answers" | "completed"
}

// 最终确认
POST /api/ai-requirement/confirm
Request:
{
  "sessionId": "sess_abc123",
  "finalRequirements": [...]       // 最终确认的需求列表
}

Response:
{
  "success": true,
  "requirementIds": ["REQ-001", "REQ-002"]
}
```

## 四、提示词设计

1. . 首次分析提示词

提示词模板的 catalog 名字是： raw-to-requirement

```txt

export const FIRST_ANALYSIS_PROMPT = `
你是一个资深的软件需求分析师。请分析以下原始需求，完成以下任务：

## 原始需求
"""
{{rawContent}}
"""

## 项目上下文
{{#if projectContext}}
已有需求: {{projectContext.existingRequirements}}
项目类型: {{projectContext.projectType}}
技术栈: {{projectContext.techStack}}
{{/if}}

## 任务

### 任务1: 拆解需求
将原始需求拆解为独立、清晰、可执行的需求点。

### 任务2: 识别模糊点
找出需求中模糊、不明确的地方，生成需要向用户澄清的问题。

### 任务3: 优先级建议
为每个需求建议优先级（高/中/低）。



## 拆解原则
1. 单一职责：每个需求只做一件事
2. 可测试性：每个需求应有明确验收标准
3. 用户价值：从用户角度思考
4. 独立性：需求之间尽量解耦

## 注意事项
- 避免生成技术实现细节
- 验收标准必须可验证
- 模糊词（快速、友好、高效）必须转化为问题
- 优先识别性能指标、安全要求、边界条件
## 输出格式
请以JSON格式返回，严格遵循以下结构：
{
  "requirements": [
    {
      "id": "req_001",
      "title": "需求标题",
      "type": "FUNCTIONAL | NFR | SECURITY | UI_UX | PERFORMANCE",
      "priority": "HIGH | MEDIUM | LOW",
      "description": "详细描述",
      "acceptanceCriteria": ["验收标准1", "验收标准2"],
      "notes": "备注信息（可选）"
    }
  ],
  "questions": [
    {
      "id": "q_001",
      "question": "需要澄清的问题",
      "relatedRequirementIds": ["req_001"],
      "answerType": "text | number | select | boolean",
      "options": ["选项1", "选项2"]  // 仅当answerType为select时需要
    }
  ]
}

请开始分析：
```

2. 后续分析提示词（带上下文）
   
提示词模板的 catalog 名字是： raw-to-requirement-with-context

```text

你是一个资深的软件需求分析师。基于之前的分析和用户的回答，请更新需求分析结果。

## 会话历史
### 原始需求
"""
{{rawContent}}
"""

### 当前需求列表
{{#each currentRequirements}}
[{{this.id}}] {{this.title}}
- 描述: {{this.description}}
- 类型: {{this.type}}
- 优先级: {{this.priority}}
{{/each}}

### 已澄清的问题
{{#each answeredQuestions}}
Q: {{this.question}}
A: {{this.answer}}
{{/each}}

### 待处理的用户确认
用户确认了以下需求: {{confirmedRequirementIds}}
用户删除了以下需求: {{deletedRequirementIds}}
用户修改了以下需求: {{modifiedRequirements}}

## 任务

### 任务1: 更新需求
根据用户的回答，更新需求列表：
- 完善模糊的描述
- 补充具体的验收标准
- 调整优先级（如果需要）
- 合并或拆分需求

### 任务2: 识别新问题
如果仍有不明确的地方，生成新的澄清问题。

### 任务3: 完成判断
如果所有需求都已经清晰，标记为完成。

## 输出格式
{
  "requirements": [
    {
      "id": "req_001",
      "title": "更新后的标题",
      "type": "FUNCTIONAL | NFR | SECURITY | UI_UX | PERFORMANCE",
      "priority": "HIGH | MEDIUM | LOW",
      "description": "更新后的描述",
      "acceptanceCriteria": ["更新后的验收标准"],
      "status": "confirmed | draft",
      "changes": "说明相对于上一轮的改动"
    }
  ],
  "questions": [
    {
      "id": "q_003",
      "question": "新的澄清问题",
      "relatedRequirementIds": ["req_001"],
      "answerType": "text"
    }
  ],
  "isComplete": true | false,
  "summary": "本轮更新的总结"
}

## 更新原则
1. 用户的回答直接用于完善需求
2. 如果回答解决了问题，更新对应的需求
3. 如果回答引入了新的模糊点，生成新问题
4. 避免重复提问已经澄清的问题

请开始更新：
```
