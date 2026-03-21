export const defaultPromptTemplates = [
  {
    name: '原始需求转需求 - 首次分析',
    description: '首次分析原始需求，拆解为结构化需求并生成追问问题',
    category: 'raw-to-requirement',
    template: `你是一个资深的软件需求分析师。请分析以下原始需求，完成以下任务：

## 原始需求

{{rawContent}}

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

请开始分析：`,
    variables: ['rawContent'],
    isDefault: true,
    isActive: true,
  },
  {
    name: '需求转用户故事 - 通用模板',
    description: '将需求转换为用户故事的通用模板',
    category: 'requirement-to-story',
    template: `请将以下需求转换为标准用户故事格式："作为[角色]，我想要[功能]，以便[价值]"

需求：{{requirement}}

请输出JSON格式，包含userStories数组，每个故事包含role、feature、value字段。`,
    variables: ['requirement'],
    isDefault: true,
    isActive: true,
  },
  {
    name: '用户故事转用例 - 通用模板',
    description: '将用户故事转换为用例的通用模板',
    category: 'story-to-use-case',
    template: `请为以下用户故事生成详细的用例：

用户故事：{{userStory}}

请输出JSON格式，包含useCases数组，每个用例包含：
- title: 用例标题
- actors: 参与者数组
- preconditions: 前置条件
- mainScenario: 主要成功场景步骤数组
- alternativeScenarios: 备选场景数组
- postconditions: 后置条件`,
    variables: ['userStory'],
    isDefault: true,
    isActive: true,
  },
  {
    name: '生成验收标准 - 通用模板',
    description: '生成Given-When-Then格式的验收标准',
    category: 'generate-acceptance',
    template: `请为以下需求生成3-5个Given-When-Then格式的验收条件，覆盖正常流程、异常流程和边界条件：

需求内容：{{requirementContent}}

请输出JSON格式，包含acceptanceCriteria数组，每个条件包含given、when、then、scenarioType字段。`,
    variables: ['requirementContent'],
    isDefault: true,
    isActive: true,
  },
  {
    name: '识别模糊词汇 - 通用模板',
    description: '识别需求中的模糊词汇并提供改进建议',
    category: 'identify-ambiguity',
    template: `请分析以下需求中的模糊词汇，并提供具体的改进建议：

需求内容：{{requirementContent}}

请输出JSON格式，包含：
- ambiguousWords: 模糊词汇数组，每个包含word、context、suggestions
- overallScore: 需求清晰度评分（0-10）
- improvementSuggestions: 整体改进建议数组`,
    variables: ['requirementContent'],
    isDefault: true,
    isActive: true,
  },
  {
    name: '生成追问 - 通用模板',
    description: '根据需求生成追问列表',
    category: 'generate-questions',
    template: `你是一个资深产品经理，请根据以下需求类型和内容，生成3-5个针对性追问，帮助完善需求：

需求类型：{{requirementType}}
需求内容：{{requirementContent}}

请输出JSON格式，包含questions数组，每个问题包含text、purpose字段。`,
    variables: ['requirementType', 'requirementContent'],
    isDefault: true,
    isActive: true,
  },
  {
    name: '质量评估 - 通用模板',
    description: '评估需求质量并提供改进建议',
    category: 'quality-assessment',
    template: `请评估以下需求的质量，并提供改进建议：

需求内容：{{requirementContent}}

请从以下维度评估：
1. 清晰度：需求是否明确、无歧义
2. 可测试性：是否可验证、可测试
3. 完整性：是否包含所有必要信息
4. 一致性：是否与现有系统一致
5. 可行性：技术实现是否可行

请输出JSON格式，包含：
- scores: 各维度评分（0-10）
- overallScore: 总体评分（0-10）
- strengths: 优点数组
- weaknesses: 缺点数组
- recommendations: 改进建议数组`,
    variables: ['requirementContent'],
    isDefault: true,
    isActive: true,
  },
  // DeepSeek特定模板
  {
    name: '需求转用户故事 - DeepSeek优化',
    description: '针对DeepSeek模型优化的用户故事生成模板',
    category: 'requirement-to-story',
    provider: 'deepseek',
    template: `你是一个专业的软件需求分析师。请将以下需求转换为标准用户故事格式。

请严格遵循以下格式：
"作为[角色]，我想要[功能]，以便[价值]"

需求：{{requirement}}

请确保：
1. 角色明确具体
2. 功能清晰可执行
3. 价值体现业务目标

请输出JSON格式：
{
  "userStories": [
    {
      "role": "具体角色",
      "feature": "具体功能",
      "value": "业务价值"
    }
  ]
}`,
    variables: ['requirement'],
    isDefault: true,
    isActive: true,
  },
  // OpenAI特定模板
  {
    name: '需求转用户故事 - OpenAI优化',
    description: '针对OpenAI GPT模型优化的用户故事生成模板',
    category: 'requirement-to-story',
    provider: 'openai',
    template: `As a professional product manager, please convert the following requirement into standard user story format.

Follow this exact format:
"As a [role], I want [feature] so that [value]"

Requirement: {{requirement}}

Please ensure:
1. Role is specific and meaningful
2. Feature is actionable and clear
3. Value demonstrates business benefit

Output JSON format:
{
  "userStories": [
    {
      "role": "specific role",
      "feature": "specific feature",
      "value": "business value"
    }
  ]
}`,
    variables: ['requirement'],
    isDefault: true,
    isActive: true,
  },
  // Ollama特定模板
  {
    name: '需求转用户故事 - Ollama优化',
    description: '针对Ollama本地模型优化的用户故事生成模板',
    category: 'requirement-to-story',
    provider: 'ollama',
    template: `请将以下需求转换为用户故事。使用中文回答。

格式要求：
"作为[角色]，我想要[功能]，以便[价值]"

需求：{{requirement}}

注意事项：
1. 角色要具体，不要用"用户"这种泛称
2. 功能要可执行、可测试
3. 价值要体现业务目标

输出JSON格式：
{
  "userStories": [
    {
      "role": "具体角色",
      "feature": "具体功能",
      "value": "业务价值"
    }
  ]
}`,
    variables: ['requirement'],
    isDefault: true,
    isActive: true,
  },
  // AI需求分析专用模板
  {
    name: 'AI需求分析 - 需求拆解',
    description: '将原始需求拆解为具体功能点并生成追问问题',
    category: 'ai-requirement-analysis',
    template: `你是一个资深产品经理，请分析以下原始需求，将其拆解为具体的功能点，并生成需要追问的问题：

原始需求：{{requirementText}}

请按照以下JSON格式输出：
{
  "analysisResults": ["需求点1", "需求点2", "需求点3", "需求点4"],
  "questions": ["追问问题1", "追问问题2"]
}

分析要求：
1. 识别需求中的核心功能点
2. 识别性能、安全等非功能需求
3. 识别模糊词汇，生成追问问题
4. 每个需求点应该是具体可执行的任务
5. 追问问题应该帮助澄清模糊点

示例：
原始需求："我希望系统登录体验更好，要快一点，还要安全，最好能支持微信登录，忘记密码也要能方便找回"
输出：
{
  "analysisResults": ["登录速度优化", "微信登录支持", "忘记密码找回", "登录失败锁定"],
  "questions": ["\"更快\"具体指多少秒？", "需要支持哪些登录方式？"]
}`,
    variables: ['requirementText'],
    isDefault: true,
    isActive: true,
  },
  {
    name: 'AI需求分析 - 生成追问',
    description: '根据需求类型和内容生成针对性追问',
    category: 'ai-generate-questions',
    template: `你是一个资深产品经理，请根据以下需求类型和内容，生成3-5个针对性追问，帮助完善需求：

需求类型：{{requirementType}}
需求内容：{{requirementContent}}

请输出JSON格式，包含questions数组，每个问题包含question和type字段。`,
    variables: ['requirementType', 'requirementContent'],
    isDefault: true,
    isActive: true,
  },
  {
    name: 'AI需求分析 - 生成验收条件',
    description: '生成Given-When-Then格式的验收条件',
    category: 'ai-generate-acceptance-criteria',
    template: `你是一个资深测试工程师，请根据以下需求内容，生成3-5个Given-When-Then格式的验收条件：

需求内容：{{requirementContent}}

请输出JSON格式，包含acceptanceCriteria数组，每个验收条件包含given、when、then和scenarioType字段。`,
    variables: ['requirementContent'],
    isDefault: true,
    isActive: true,
  },
  {
    name: 'AI需求分析 - 质量评分',
    description: '评估需求质量并提供改进建议',
    category: 'ai-quality-assessment',
    template: `你是一个资深需求分析师，请评估以下需求的质量，给出清晰度、可测试性、完整性的评分（0-10分）：

需求文本：{{text}}

请输出JSON格式：
{
  "clarity": 8,
  "testability": 7,
  "completeness": 6,
  "totalScore": 7,
  "suggestions": ["改进建议1", "改进建议2"]
}

评分标准：
1. 清晰度：需求描述是否明确无歧义
2. 可测试性：需求是否可以被验证和测试
3. 完整性：需求是否包含所有必要信息`,
    variables: ['text'],
    isDefault: true,
    isActive: true,
  },
  {
    name: 'AI需求分析 - 需求验证',
    description: '验证需求是否完整、可测试、无歧义',
    category: 'ai-validate-requirement',
    template: `你是一个资深需求分析师，请验证以下需求是否完整、可测试、无歧义：

需求：{{requirementText}}

请输出JSON格式：
{
  "isValid": true,
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}

验证标准：
1. 需求是否包含明确的角色、功能、价值
2. 需求是否可测试和验证
3. 需求是否有模糊词汇
4. 需求是否包含必要的约束条件`,
    variables: ['requirementText'],
    isDefault: true,
    isActive: true,
  },
  {
    name: 'AI需求分析 - 改进建议',
    description: '为需求提供改进建议',
    category: 'ai-suggest-improvements',
    template: `你是一个资深产品经理，请为以下需求提供改进建议：

需求：{{requirementText}}

请输出JSON格式：
{
  "improvements": ["改进建议1", "改进建议2", "改进建议3"],
  "rationale": "改进的理由和预期效果"
}

改进方向：
1. 使需求更具体和可量化
2. 提高需求的可测试性
3. 消除模糊词汇
4. 补充缺失的信息`,
    variables: ['requirementText'],
    isDefault: true,
    isActive: true,
  },
  {
    name: '原始需求转需求 - 带上下文',
    description: '基于之前的分析和用户回答，更新需求分析结果',
    category: 'raw-to-requirement-with-context',
    template: `你是一个资深的软件需求分析师。基于之前的分析和用户的回答，请更新需求分析结果。

## 会话历史
### 原始需求

{{rawContent}}

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

请开始更新：`,
    variables: ['rawContent', 'currentRequirements', 'answeredQuestions', 'confirmedRequirementIds'],
    isDefault: true,
    isActive: true,
  },
]
