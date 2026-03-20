import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import type { CreateRequirementDto as SharedCreateRequirementDto } from '@oops-ai/shared'

export class CreateRequirementDto implements SharedCreateRequirementDto {
  @ApiProperty({ description: '需求标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '需求描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '原始输入', required: false })
  @IsOptional()
  @IsString()
  rawInput?: string

  @ApiProperty({ description: '项目ID' })
  @IsString()
  projectId: string

  @ApiProperty({ description: '状态', required: false, default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ description: '优先级', required: false, default: 'medium' })
  @IsOptional()
  @IsString()
  priority?: string

  @ApiProperty({ description: '故事点', required: false })
  @IsOptional()
  @IsNumber()
  storyPoints?: number

  @ApiProperty({ description: '负责人ID', required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string
}

export class UpdateRequirementDto {
  @ApiProperty({ description: '需求标题', required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ description: '需求描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '结构化数据', required: false })
  @IsOptional()
  structuredData?: any

  @ApiProperty({ description: '质量评分', required: false })
  @IsOptional()
  qualityScore?: any

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @IsString()
  priority?: string

  @ApiProperty({ description: '故事点', required: false })
  @IsOptional()
  @IsNumber()
  storyPoints?: number

  @ApiProperty({ description: '负责人ID', required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string

  @ApiProperty({ description: '截止日期', required: false })
  @IsOptional()
  dueDate?: Date
}

export class AnalyzeFuzzyWordsDto {
  @ApiProperty({ description: '要分析的文本' })
  @IsString()
  text: string
}

export class AnalyzeRequirementDto {
  @ApiProperty({ description: '原始需求文本' })
  @IsString()
  requirementText: string

  @ApiProperty({ description: '追问问题列表', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questions?: string[]

  @ApiProperty({ description: '追问答案列表', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  answers?: string[]
}

export class GenerateQuestionsDto {
  @ApiProperty({ description: '需求类型' })
  @IsString()
  requirementType: string

  @ApiProperty({ description: '需求内容' })
  @IsString()
  requirementContent: string
}

export class GenerateUserStoriesDto {
  @ApiProperty({ description: '用户输入的一句话需求' })
  @IsString()
  userInput: string
}

export class GenerateAcceptanceCriteriaDto {
  @ApiProperty({ description: '需求内容' })
  @IsString()
  requirementContent: string
}

export class QualityScoreDto {
  @ApiProperty({ description: '需求文本' })
  @IsString()
  text: string
}

export class FuzzyWordAnalysis {
  @ApiProperty({ description: '原始文本' })
  text: string

  @ApiProperty({ description: '模糊词列表', type: [Object] })
  fuzzyWords: Array<{
    word: string
    positions: Array<{
      start: number
      end: number
    }>
  }>

  @ApiProperty({ description: '改进建议' })
  suggestion: string
}

export class QuestionItem {
  @ApiProperty({ description: '问题内容' })
  question: string

  @ApiProperty({ description: '问题类型' })
  type: string
}

export class UserStory {
  @ApiProperty({ description: '角色' })
  role: string

  @ApiProperty({ description: '功能' })
  feature: string

  @ApiProperty({ description: '价值' })
  value: string

  @ApiProperty({ description: '故事点估算', required: false })
  storyPoints?: number
}

export class AcceptanceCriterion {
  @ApiProperty({ description: 'Given部分' })
  given: string

  @ApiProperty({ description: 'When部分' })
  when: string

  @ApiProperty({ description: 'Then部分' })
  then: string

  @ApiProperty({ description: '场景类型' })
  scenarioType: 'normal' | 'exception' | 'boundary'
}

export class QualityScore {
  @ApiProperty({ description: '清晰度评分' })
  clarity: number

  @ApiProperty({ description: '可测试性评分' })
  testability: number

  @ApiProperty({ description: '完整性评分' })
  completeness: number

  @ApiProperty({ description: '总分' })
  totalScore: number

  @ApiProperty({ description: '改进建议', type: [String] })
  suggestions: string[]
}

export class RequirementAnalysisResponse {
  @ApiProperty({ description: '分析结果', type: [String] })
  analysisResults: string[]

  @ApiProperty({ description: '追问问题', type: [String] })
  questions: string[]
}

// ============================================
// 1. 原始需求 (Raw Need) DTO
// ============================================

export class CreateRawRequirementDto {
  @ApiProperty({ description: '原始需求内容' })
  @IsString()
  content: string

  @ApiProperty({ description: '来源类型', default: 'manual_input' })
  @IsOptional()
  @IsString()
  sourceType?: string

  @ApiProperty({ description: '来源元数据', required: false })
  @IsOptional()
  sourceMeta?: any

  @ApiProperty({ description: '提出人', required: false })
  @IsOptional()
  @IsString()
  proposedBy?: string

  @ApiProperty({ description: '提出时间', required: false })
  @IsOptional()
  proposedAt?: Date

  @ApiProperty({ description: '提出场景', required: false })
  @IsOptional()
  @IsString()
  scenario?: string
}

export class UpdateRawRequirementDto {
  @ApiProperty({ description: '原始需求内容', required: false })
  @IsOptional()
  @IsString()
  content?: string

  @ApiProperty({ description: '来源类型', required: false })
  @IsOptional()
  @IsString()
  sourceType?: string

  @ApiProperty({ description: '来源元数据', required: false })
  @IsOptional()
  sourceMeta?: any

  @ApiProperty({ description: '提出人', required: false })
  @IsOptional()
  @IsString()
  proposedBy?: string

  @ApiProperty({ description: '提出时间', required: false })
  @IsOptional()
  proposedAt?: Date

  @ApiProperty({ description: '提出场景', required: false })
  @IsOptional()
  @IsString()
  scenario?: string
}

// ============================================
// 2. 用户故事 (User Story) DTO
// ============================================

export class CreateUserStoryDto {
  @ApiProperty({ description: '角色' })
  @IsString()
  role: string

  @ApiProperty({ description: '想要的功能' })
  @IsString()
  want: string

  @ApiProperty({ description: '带来的价值', required: false })
  @IsOptional()
  @IsString()
  soThat?: string

  @ApiProperty({ description: '验收要点', required: false })
  @IsOptional()
  @IsString()
  acceptanceNotes?: string

  @ApiProperty({ description: '故事点估算', required: false })
  @IsOptional()
  @IsNumber()
  storyPoints?: number
}

export class UpdateUserStoryDto {
  @ApiProperty({ description: '角色', required: false })
  @IsOptional()
  @IsString()
  role?: string

  @ApiProperty({ description: '想要的功能', required: false })
  @IsOptional()
  @IsString()
  want?: string

  @ApiProperty({ description: '带来的价值', required: false })
  @IsOptional()
  @IsString()
  soThat?: string

  @ApiProperty({ description: '验收要点', required: false })
  @IsOptional()
  @IsString()
  acceptanceNotes?: string

  @ApiProperty({ description: '故事点估算', required: false })
  @IsOptional()
  @IsNumber()
  storyPoints?: number
}

// ============================================
// 3. 验收标准 (Acceptance Criteria) DTO
// ============================================

export class CreateAcceptanceCriteriaDto {
  @ApiProperty({ description: '场景名称' })
  @IsString()
  scenario: string

  @ApiProperty({ description: '前置条件', type: [String] })
  @IsArray()
  @IsString({ each: true })
  given: string[]

  @ApiProperty({ description: '操作' })
  @IsString()
  when: string

  @ApiProperty({ description: '预期结果', type: [String] })
  @IsArray()
  @IsString({ each: true })
  then: string[]

  @ApiProperty({ description: '补充条件', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  and?: string[]

  @ApiProperty({ description: '场景类型', default: 'normal' })
  @IsOptional()
  @IsString()
  scenarioType?: string
}

export class UpdateAcceptanceCriteriaDto {
  @ApiProperty({ description: '场景名称', required: false })
  @IsOptional()
  @IsString()
  scenario?: string

  @ApiProperty({ description: '前置条件', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  given?: string[]

  @ApiProperty({ description: '操作', required: false })
  @IsOptional()
  @IsString()
  when?: string

  @ApiProperty({ description: '预期结果', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  then?: string[]

  @ApiProperty({ description: '补充条件', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  and?: string[]

  @ApiProperty({ description: '场景类型', required: false })
  @IsOptional()
  @IsString()
  scenarioType?: string

  @ApiProperty({ description: '验收状态', required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ description: '测试证据', required: false })
  @IsOptional()
  @IsString()
  testEvidence?: string
}

// ============================================
// 4. 测试用例 (Test Cases) DTO
// ============================================

export class CreateTestCaseDto {
  @ApiProperty({ description: '测试用例标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '测试用例描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '前置条件', type: [String] })
  @IsArray()
  @IsString({ each: true })
  preconditions: string[]

  @ApiProperty({ description: '测试步骤', type: [Object] })
  @IsArray()
  testSteps: Array<{ step: string; data?: string; expected: string }>

  @ApiProperty({ description: '测试数据', required: false })
  @IsOptional()
  testData?: any

  @ApiProperty({ description: '自动化状态', default: 'manual' })
  @IsOptional()
  @IsString()
  automationStatus?: string

  @ApiProperty({ description: '自动化脚本', required: false })
  @IsOptional()
  @IsString()
  automationScript?: string

  @ApiProperty({ description: '自动化框架', required: false })
  @IsOptional()
  @IsString()
  automationFramework?: string

  @ApiProperty({ description: '关联的验收标准ID', required: false })
  @IsOptional()
  @IsString()
  acceptanceCriteriaId?: string
}

export class UpdateTestCaseDto {
  @ApiProperty({ description: '测试用例标题', required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ description: '测试用例描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '前置条件', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preconditions?: string[]

  @ApiProperty({ description: '测试步骤', type: [Object], required: false })
  @IsOptional()
  @IsArray()
  testSteps?: Array<{ step: string; data?: string; expected: string }>

  @ApiProperty({ description: '测试数据', required: false })
  @IsOptional()
  testData?: any

  @ApiProperty({ description: '自动化状态', required: false })
  @IsOptional()
  @IsString()
  automationStatus?: string

  @ApiProperty({ description: '自动化脚本', required: false })
  @IsOptional()
  @IsString()
  automationScript?: string

  @ApiProperty({ description: '自动化框架', required: false })
  @IsOptional()
  @IsString()
  automationFramework?: string

  @ApiProperty({ description: '关联的验收标准ID', required: false })
  @IsOptional()
  @IsString()
  acceptanceCriteriaId?: string
}

// ============================================
// 5. 业务规则 (Business Rules) DTO
// ============================================

export class CreateBusinessRuleDto {
  @ApiProperty({ description: '业务规则编号' })
  @IsString()
  ruleId: string

  @ApiProperty({ description: '业务规则名称' })
  @IsString()
  ruleName: string

  @ApiProperty({ description: '业务规则类型', default: 'constraint' })
  @IsOptional()
  @IsString()
  ruleType?: string

  @ApiProperty({ description: '业务规则表达式' })
  @IsString()
  ruleExpression: string

  @ApiProperty({ description: '业务规则描述' })
  @IsString()
  ruleDescription: string

  @ApiProperty({ description: '条件', required: false })
  @IsOptional()
  @IsString()
  condition?: string

  @ApiProperty({ description: '动作', required: false })
  @IsOptional()
  @IsString()
  action?: string

  @ApiProperty({ description: '否则动作', required: false })
  @IsOptional()
  @IsString()
  elseAction?: string

  @ApiProperty({ description: '生效时间', required: false })
  @IsOptional()
  effectiveFrom?: Date

  @ApiProperty({ description: '失效时间', required: false })
  @IsOptional()
  effectiveTo?: Date

  @ApiProperty({ description: '优先级', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number

  @ApiProperty({ description: '影响的模块', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedModules?: string[]
}

export class UpdateBusinessRuleDto {
  @ApiProperty({ description: '业务规则编号', required: false })
  @IsOptional()
  @IsString()
  ruleId?: string

  @ApiProperty({ description: '业务规则名称', required: false })
  @IsOptional()
  @IsString()
  ruleName?: string

  @ApiProperty({ description: '业务规则类型', required: false })
  @IsOptional()
  @IsString()
  ruleType?: string

  @ApiProperty({ description: '业务规则表达式', required: false })
  @IsOptional()
  @IsString()
  ruleExpression?: string

  @ApiProperty({ description: '业务规则描述', required: false })
  @IsOptional()
  @IsString()
  ruleDescription?: string

  @ApiProperty({ description: '条件', required: false })
  @IsOptional()
  @IsString()
  condition?: string

  @ApiProperty({ description: '动作', required: false })
  @IsOptional()
  @IsString()
  action?: string

  @ApiProperty({ description: '否则动作', required: false })
  @IsOptional()
  @IsString()
  elseAction?: string

  @ApiProperty({ description: '生效时间', required: false })
  @IsOptional()
  effectiveFrom?: Date

  @ApiProperty({ description: '失效时间', required: false })
  @IsOptional()
  effectiveTo?: Date

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number

  @ApiProperty({ description: '影响的模块', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedModules?: string[]
}

// ============================================
// 6. 非功能需求 (Non-functional Requirements) DTO
// ============================================

export class CreateNFRRequirementDto {
  @ApiProperty({ description: '非功能需求类型' })
  @IsString()
  nfrType: string

  @ApiProperty({ description: '指标名称' })
  @IsString()
  metric: string

  @ApiProperty({ description: '目标值' })
  @IsNumber()
  targetValue: number

  @ApiProperty({ description: '单位' })
  @IsString()
  unit: string

  @ApiProperty({ description: '比较符号', default: '<=' })
  @IsOptional()
  @IsString()
  comparison?: string

  @ApiProperty({ description: '警告阈值', required: false })
  @IsOptional()
  @IsNumber()
  warningThreshold?: number

  @ApiProperty({ description: '临界阈值', required: false })
  @IsOptional()
  @IsNumber()
  criticalThreshold?: number

  @ApiProperty({ description: '测量方法', required: false })
  @IsOptional()
  @IsString()
  measurementMethod?: string

  @ApiProperty({ description: '测量工具', required: false })
  @IsOptional()
  @IsString()
  measurementTool?: string
}

export class UpdateNFRRequirementDto {
  @ApiProperty({ description: '非功能需求类型', required: false })
  @IsOptional()
  @IsString()
  nfrType?: string

  @ApiProperty({ description: '指标名称', required: false })
  @IsOptional()
  @IsString()
  metric?: string

  @ApiProperty({ description: '目标值', required: false })
  @IsOptional()
  @IsNumber()
  targetValue?: number

  @ApiProperty({ description: '单位', required: false })
  @IsOptional()
  @IsString()
  unit?: string

  @ApiProperty({ description: '比较符号', required: false })
  @IsOptional()
  @IsString()
  comparison?: string

  @ApiProperty({ description: '警告阈值', required: false })
  @IsOptional()
  @IsNumber()
  warningThreshold?: number

  @ApiProperty({ description: '临界阈值', required: false })
  @IsOptional()
  @IsNumber()
  criticalThreshold?: number

  @ApiProperty({ description: '测量方法', required: false })
  @IsOptional()
  @IsString()
  measurementMethod?: string

  @ApiProperty({ description: '测量工具', required: false })
  @IsOptional()
  @IsString()
  measurementTool?: string

  @ApiProperty({ description: '验证状态', required: false })
  @IsOptional()
  @IsString()
  verificationStatus?: string

  @ApiProperty({ description: '上次验证值', required: false })
  @IsOptional()
  @IsNumber()
  lastVerifiedValue?: number
}

// ============================================
// 7. 依赖关系 (Dependencies) DTO
// ============================================

export class CreateRequirementDependencyDto {
  @ApiProperty({ description: '依赖的需求ID' })
  @IsString()
  dependsOnId: string

  @ApiProperty({ description: '依赖类型', default: 'blocks' })
  @IsOptional()
  @IsString()
  dependencyType?: string

  @ApiProperty({ description: '依赖描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '依赖强度', default: 1.0 })
  @IsOptional()
  @IsNumber()
  strength?: number
}

export class UpdateRequirementDependencyDto {
  @ApiProperty({ description: '依赖类型', required: false })
  @IsOptional()
  @IsString()
  dependencyType?: string

  @ApiProperty({ description: '依赖描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '依赖强度', required: false })
  @IsOptional()
  @IsNumber()
  strength?: number
}

// ============================================
// 8. 验收签名 (Acceptance Sign-off) DTO
// ============================================

export class CreateAcceptanceSignoffDto {
  @ApiProperty({ description: '签名类型', default: 'functional' })
  @IsOptional()
  @IsString()
  signoffType?: string

  @ApiProperty({ description: '关联的验收标准ID列表', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteriaIds?: string[]

  @ApiProperty({ description: '里程碑', required: false })
  @IsOptional()
  @IsString()
  milestone?: string

  @ApiProperty({ description: '发布版本', required: false })
  @IsOptional()
  @IsString()
  releaseVersion?: string
}

export class UpdateAcceptanceSignoffDto {
  @ApiProperty({ description: '签名类型', required: false })
  @IsOptional()
  @IsString()
  signoffType?: string

  @ApiProperty({ description: '签名状态', required: false })
  @IsOptional()
  @IsString()
  signoffStatus?: string

  @ApiProperty({ description: '签名证据', required: false })
  @IsOptional()
  @IsString()
  signoffEvidence?: string

  @ApiProperty({ description: '评论', required: false })
  @IsOptional()
  @IsString()
  comments?: string

  @ApiProperty({ description: '关联的验收标准ID列表', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteriaIds?: string[]

  @ApiProperty({ description: '里程碑', required: false })
  @IsOptional()
  @IsString()
  milestone?: string

  @ApiProperty({ description: '发布版本', required: false })
  @IsOptional()
  @IsString()
  releaseVersion?: string
}

// ============================================
// 9. 需求定义 (Requirement Definition) DTO
// ============================================

export class CreateRequirementDefinitionDto {
  @ApiProperty({ description: '需求定义标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '需求详细描述' })
  @IsString()
  detailedDescription: string

  @ApiProperty({ description: '验收标准', type: [String] })
  @IsArray()
  @IsString({ each: true })
  acceptanceCriteria: string[]

  @ApiProperty({ description: '业务规则', type: [String] })
  @IsArray()
  @IsString({ each: true })
  businessRules: string[]

  @ApiProperty({ description: '依赖关系', type: [String] })
  @IsArray()
  @IsString({ each: true })
  dependencies: string[]

  @ApiProperty({ description: '假设条件', type: [String] })
  @IsArray()
  @IsString({ each: true })
  assumptions: string[]

  @ApiProperty({ description: '约束条件', type: [String] })
  @IsArray()
  @IsString({ each: true })
  constraints: string[]

  @ApiProperty({ description: '风险说明', type: [String] })
  @IsArray()
  @IsString({ each: true })
  riskNotes: string[]

  @ApiProperty({ description: '预估工作量', required: false })
  @IsOptional()
  @IsNumber()
  estimatedEffort?: number

  @ApiProperty({ description: '预估成本', required: false })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number

  @ApiProperty({ description: '需求定义状态', default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string
}

export class UpdateRequirementDefinitionDto {
  @ApiProperty({ description: '需求定义标题', required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ description: '需求详细描述', required: false })
  @IsOptional()
  @IsString()
  detailedDescription?: string

  @ApiProperty({ description: '验收标准', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptanceCriteria?: string[]

  @ApiProperty({ description: '业务规则', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessRules?: string[]

  @ApiProperty({ description: '依赖关系', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[]

  @ApiProperty({ description: '假设条件', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assumptions?: string[]

  @ApiProperty({ description: '约束条件', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  constraints?: string[]

  @ApiProperty({ description: '风险说明', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskNotes?: string[]

  @ApiProperty({ description: '预估工作量', required: false })
  @IsOptional()
  @IsNumber()
  estimatedEffort?: number

  @ApiProperty({ description: '预估成本', required: false })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number

  @ApiProperty({ description: '需求定义状态', required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ description: '变更描述', required: false })
  @IsOptional()
  @IsString()
  changeDescription?: string
}
