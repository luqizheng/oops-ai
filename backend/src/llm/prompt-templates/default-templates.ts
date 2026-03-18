export const defaultPromptTemplates = [
  {
    name: '原始需求转需求 - 通用模板',
    description: '将原始需求转换为结构化需求的通用模板',
    category: 'raw-to-requirement',
    template: `你是一个资深产品经理，请将以下原始需求解析为结构化需求。

原始需求: {{rawRequirement}}

请输出JSON格式:

{
  "user_roles": ["角色1", "角色2"],
  "functional_requirements": [
    {
      "description": "功能描述",
      "priority": "high/medium/low",
      "acceptance_criteria": ["条件1", "条件2"]
    }
  ],
  "non_functional_requirements": {
    "performance": "性能要求",
    "security": "安全要求",
    "usability": "可用性要求"
  },
  "constraints": ["约束1", "约束2"],
  "questions_to_ask": ["追问1", "追问2"]
}`,
    variables: ['rawRequirement'],
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
]
