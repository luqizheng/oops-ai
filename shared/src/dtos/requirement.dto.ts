// 需求创建 DTO
export interface ICreateRequirementDto {
  title: string;
  description?: string;
  rawInput?: string;
  projectId: string;
  status?: string;
  priority?: string;
  storyPoints?: number;
  assigneeId?: string;
}

// 需求更新 DTO
export interface IUpdateRequirementDto {
  title?: string;
  description?: string;
  structuredData?: any;
  qualityScore?: any;
  status?: string;
  priority?: string;
  storyPoints?: number;
  assigneeId?: string;
  dueDate?: Date;
}

// 模糊词分析 DTO
export interface AnalyzeFuzzyWordsDto {
  text: string;
}

// 需求分析 DTO
export interface AnalyzeRequirementDto {
  requirementText: string;
  sessionId?: string;
  answers?: Array<{
    questionId: string;
    answer: string;
  }>;
  confirmedRequirements?: string[];
}

// 结构化需求
export interface StructuredRequirement {
  id: string;
  title: string;
  type: "FUNCTIONAL" | "NFR" | "SECURITY" | "UI_UX" | "PERFORMANCE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  acceptanceCriteria: string[];
  notes?: string;
  status: "draft" | "confirmed" | "merged" | "deleted";
  changes?: string;
}

// 澄清问题
export interface ClarifyingQuestion {
  id: string;
  question: string;
  relatedRequirementIds: string[];
  answerType: "text" | "number" | "select" | "boolean";
  options?: string[];
  answer?: string;
}

// 已回答的问题
export interface AnsweredQuestion {
  questionId: string;
  question: string;
  answer: string;
  answeredAt: Date;
}

// 会话上下文
export interface AnalysisSession {
  sessionId: string;
  rawContent: string;
  currentRequirements: any;
  pendingQuestions: any;
  answeredQuestions: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// 生成问题 DTO
export interface GenerateQuestionsDto {
  requirementType: string;
  requirementContent: string;
}

// 生成用户故事 DTO
export interface GenerateUserStoriesDto {
  userInput: string;
}

// 生成验收标准 DTO
export interface GenerateAcceptanceCriteriaDto {
  requirementContent: string;
}

// 质量评分 DTO
export interface QualityScoreDto {
  text: string;
}

// 模糊词分析结果
export interface FuzzyWordAnalysis {
  text: string;
  fuzzyWords: Array<{
    word: string;
    positions: Array<{
      start: number;
      end: number;
    }>;
  }>;
  suggestion: string;
}

// 问题项
export interface QuestionItem {
  question: string;
  type: string;
}

// 用户故事 DTO
export interface UserStoryDto {
  role: string;
  feature: string;
  value: string;
  storyPoints?: number;
}

// 验收标准 DTO
export interface AcceptanceCriterionDto {
  given: string;
  when: string;
  then: string;
  scenarioType: 'normal' | 'exception' | 'boundary';
}

// 质量评分结果
export interface IQualityScore {
  clarity: number;
  testability: number;
  completeness: number;
  totalScore: number;
  suggestions: string[];
}

// 需求分析响应
export interface RequirementAnalysisResponse {
  sessionId: string;
  requirements: StructuredRequirement[];
  pendingQuestions: ClarifyingQuestion[];
  status: "analyzing" | "waiting_for_answers" | "completed";
  isComplete?: boolean;
  summary?: string;
}

// 原始需求创建 DTO
export interface CreateRawRequirementDto {
  content: string;
  sourceType?: string;
  sourceMeta?: any;
  proposedBy?: string;
  proposedAt?: Date;
  scenario?: string;
}

// 原始需求更新 DTO
export interface UpdateRawRequirementDto {
  content?: string;
  sourceType?: string;
  sourceMeta?: any;
  proposedBy?: string;
  proposedAt?: Date;
  scenario?: string;
}

// 用户故事创建 DTO
export interface CreateUserStoryDto {
  role: string;
  want: string;
  soThat?: string;
  acceptanceNotes?: string;
  storyPoints?: number;
}

// 用户故事更新 DTO
export interface UpdateUserStoryDto {
  role?: string;
  want?: string;
  soThat?: string;
  acceptanceNotes?: string;
  storyPoints?: number;
}

// 验收标准创建 DTO
export interface CreateAcceptanceCriteriaDto {
  scenario: string;
  given: string[];
  when: string;
  then: string[];
  and?: string[];
  scenarioType?: string;
}

// 验收标准更新 DTO
export interface UpdateAcceptanceCriteriaDto {
  scenario?: string;
  given?: string[];
  when?: string;
  then?: string[];
  and?: string[];
  scenarioType?: string;
  status?: string;
  testEvidence?: string;
}

// 需求列表项 DTO
export interface RequirementListItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
  priority: string;
  status: string;
  storyPoints?: number;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  };
  reporterId?: string;
  reporter?: {
    id: string;
    name: string | null;
    email: string;
  };
  projectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 需求视图模型 DTO
export interface RequirementViewModel extends RequirementListItem {
  rawRequirementId?: string;
  rawInput?: string;
  structuredData?: any;
  qualityScore?: any;
  dueDate?: Date | string;
}

// 创建需求结果 DTO
export interface CreateRequirementResult extends RequirementViewModel {}

// 更新需求结果 DTO
export interface UpdateRequirementResult extends RequirementViewModel {}

// 删除需求结果 DTO
export interface DeleteRequirementResult {
  success: boolean;
  message?: string;
}

// 需求分页结果 DTO
export interface RequirementPaginatedResult {
  data: RequirementListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 创建需求提交 DTO
export interface ICreateRequirementSubmit {
  title: string;
  description?: string;
  rawInput?: string;
  projectId: string;
  status?: string;
  priority?: string;
  storyPoints?: number;
  assigneeId?: string;
}

// 更新需求提交 DTO
export interface IUpdateRequirementSubmit {
  title?: string;
  description?: string;
  structuredData?: any;
  qualityScore?: any;
  status?: string;
  priority?: string;
  storyPoints?: number;
  assigneeId?: string;
  dueDate?: Date | string;
}

// 测试用例创建 DTO
export interface CreateTestCaseDto {
  title: string;
  description?: string;
  preconditions: string[];
  testSteps: Array<{ step: string; data?: string; expected: string }>;
  testData?: any;
  automationStatus?: string;
  automationScript?: string;
  automationFramework?: string;
  acceptanceCriteriaId?: string;
}

// 测试用例更新 DTO
export interface UpdateTestCaseDto {
  title?: string;
  description?: string;
  preconditions?: string[];
  testSteps?: Array<{ step: string; data?: string; expected: string }>;
  testData?: any;
  automationStatus?: string;
  automationScript?: string;
  automationFramework?: string;
  acceptanceCriteriaId?: string;
}

// 业务规则创建 DTO
export interface CreateBusinessRuleDto {
  ruleId: string;
  ruleName: string;
  ruleType?: string;
  ruleExpression: string;
  ruleDescription: string;
  condition?: string;
  action?: string;
  elseAction?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  priority?: number;
  affectedModules?: string[];
}

// 业务规则更新 DTO
export interface UpdateBusinessRuleDto {
  ruleId?: string;
  ruleName?: string;
  ruleType?: string;
  ruleExpression?: string;
  ruleDescription?: string;
  condition?: string;
  action?: string;
  elseAction?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  priority?: number;
  affectedModules?: string[];
}

// 非功能需求创建 DTO
export interface CreateNFRRequirementDto {
  nfrType: string;
  metric: string;
  targetValue: number;
  unit: string;
  comparison?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  measurementMethod?: string;
  measurementTool?: string;
}

// 非功能需求更新 DTO
export interface UpdateNFRRequirementDto {
  nfrType?: string;
  metric?: string;
  targetValue?: number;
  unit?: string;
  comparison?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  measurementMethod?: string;
  measurementTool?: string;
  verificationStatus?: string;
  lastVerifiedValue?: number;
}

// 依赖关系创建 DTO
export interface CreateRequirementDependencyDto {
  dependsOnId: string;
  dependencyType?: string;
  description?: string;
  strength?: number;
}

// 依赖关系更新 DTO
export interface UpdateRequirementDependencyDto {
  dependencyType?: string;
  description?: string;
  strength?: number;
}

// 验收签名创建 DTO
export interface CreateAcceptanceSignoffDto {
  signoffType?: string;
  criteriaIds?: string[];
  milestone?: string;
  releaseVersion?: string;
}

// 验收签名更新 DTO
export interface UpdateAcceptanceSignoffDto {
  signoffType?: string;
  signoffStatus?: string;
  signoffEvidence?: string;
  comments?: string;
  criteriaIds?: string[];
  milestone?: string;
  releaseVersion?: string;
}

// 需求定义创建 DTO
export interface CreateRequirementDefinitionDto {
  title: string;
  detailedDescription: string;
  acceptanceCriteria: string[];
  businessRules: string[];
  dependencies: string[];
  assumptions: string[];
  constraints: string[];
  riskNotes: string[];
  estimatedEffort?: number;
  estimatedCost?: number;
  status?: string;
}

// 需求定义更新 DTO
export interface UpdateRequirementDefinitionDto {
  title?: string;
  detailedDescription?: string;
  acceptanceCriteria?: string[];
  businessRules?: string[];
  dependencies?: string[];
  assumptions?: string[];
  constraints?: string[];
  riskNotes?: string[];
  estimatedEffort?: number;
  estimatedCost?: number;
  status?: string;
  changeDescription?: string;
}
