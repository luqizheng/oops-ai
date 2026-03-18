// 需求创建 DTO
export interface CreateRequirementDto {
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
export interface UpdateRequirementDto {
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
export interface QualityScore {
  clarity: number;
  testability: number;
  completeness: number;
  totalScore: number;
  suggestions: string[];
}

// 需求分析响应
export interface RequirementAnalysisResponse {
  analysisResults: string[];
  questions: string[];
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
