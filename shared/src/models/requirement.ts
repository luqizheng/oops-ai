// 需求状态枚举
export enum RequirementStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IMPLEMENTING = 'IMPLEMENTING',
  TESTING = 'TESTING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

// 需求优先级枚举
export enum RequirementPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// 需求类型枚举
export enum RequirementType {
  FEATURE = 'FEATURE',
  BUGFIX = 'BUGFIX',
  ENHANCEMENT = 'ENHANCEMENT',
  TASK = 'TASK',
  NON_FUNCTIONAL = 'NON_FUNCTIONAL'
}

// 核心需求实体
export interface Requirement {
  id: string;
  projectId: string;
  rawRequirementId?: string;
  title: string;
  description?: string;
  status: RequirementStatus;
  priority: RequirementPriority;
  type: RequirementType;
  storyPoints?: number;
  rawInput?: string;
  structuredData?: any;
  qualityScore?: any;
  vectorEmbedding?: string;
  assigneeId?: string;
  reporterId: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 附件类型
export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: string;
  uploadedAt: Date;
}

// 原始需求
export interface RawRequirement {
  id: string;
  content: string;
  sourceType: string;
  sourceMeta?: any;
  proposedBy?: string;
  proposedAt: Date;
  scenario?: string;
  projectId: string;
  contactPerson?: string;
  contactInfo?: string;
  attachments: Attachment[];
  createdAt: Date;
}

// 用户故事
export interface UserStory {
  id: string;
  requirementId: string;
  role: string;
  want: string;
  soThat?: string;
  acceptanceNotes?: string;
  storyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 验收标准状态枚举
export enum AcceptanceCriteriaStatus {
  NOT_TESTED = 'NOT_TESTED',
  PASS = 'PASS',
  FAIL = 'FAIL',
  BLOCKED = 'BLOCKED',
  IN_PROGRESS = 'IN_PROGRESS'
}

// 验收标准
export interface IAcceptanceCriteria {
  id: string;
  requirementId: string;
  scenario: string;
  given: string[];
  when: string;
  then: string[];
  and?: string[];
  scenarioType: string;
  status: AcceptanceCriteriaStatus;
  testedById?: string;
  testedAt?: Date;
  testEvidence?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 测试用例自动化状态枚举
export enum TestCaseAutomationStatus {
  MANUAL = 'MANUAL',
  AUTOMATED = 'AUTOMATED',
  PARTIALLY_AUTOMATED = 'PARTIALLY_AUTOMATED',
  NOT_AUTOMATABLE = 'NOT_AUTOMATABLE'
}

// 测试用例运行状态枚举
export enum TestCaseRunStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  BLOCKED = 'BLOCKED',
  SKIPPED = 'SKIPPED',
  IN_PROGRESS = 'IN_PROGRESS'
}

// 测试用例
export interface ITestCase {
  id: string;
  requirementId: string;
  acceptanceCriteriaId?: string;
  title: string;
  description?: string;
  preconditions: string[];
  testSteps: Array<{ step: string; data?: string; expected: string }>;
  testData?: any;
  automationStatus: TestCaseAutomationStatus;
  automationScript?: string;
  automationFramework?: string;
  lastRunStatus?: TestCaseRunStatus;
  lastRunAt?: Date;
  lastRunById?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 业务规则
export interface IBusinessRule {
  id: string;
  requirementId: string;
  ruleId: string;
  ruleName: string;
  ruleType: string;
  ruleExpression: string;
  ruleDescription: string;
  condition?: string;
  action?: string;
  elseAction?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  priority: number;
  affectedModules?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// NFR验证状态枚举
export enum NFRVerificationStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  PASSED = 'PASSED',
  WARNING = 'WARNING',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS'
}

// 非功能需求
export interface NFRRequirement {
  id: string;
  requirementId: string;
  nfrType: string;
  metric: string;
  targetValue: number;
  unit: string;
  comparison: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  measurementMethod?: string;
  measurementTool?: string;
  verificationStatus: NFRVerificationStatus;
  lastVerifiedAt?: Date;
  lastVerifiedValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 依赖关系
export interface RequirementDependency {
  id: string;
  requirementId: string;
  dependsOnId: string;
  dependencyType: string;
  description?: string;
  strength: number;
  createdAt: Date;
  updatedAt: Date;
}

// 验收签名状态枚举
export enum AcceptanceSignoffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONDITIONAL = 'CONDITIONAL'
}

// 验收签名
export interface AcceptanceSignoff {
  id: string;
  requirementId: string;
  signoffType: string;
  signoffStatus: AcceptanceSignoffStatus;
  signedById?: string;
  signedAt?: Date;
  signoffEvidence?: string;
  comments?: string;
  criteriaIds?: string[];
  milestone?: string;
  releaseVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 需求定义 (PRD/规格说明书)
export interface RequirementDefinition {
  id: string;
  requirementId: string;
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
  definedById: string;
  definedAt: Date;
  lastUpdatedById?: string;
  lastUpdatedAt?: Date;
  status: string;
  version: number;
  changeHistory: Array<{
    version: number;
    changedBy: string;
    changedAt: Date;
    changeDescription: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
