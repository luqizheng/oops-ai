// 核心需求实体
export interface Requirement {
  id: string;
  projectId: string;
  rawRequirementId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
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

// 验收标准
export interface AcceptanceCriteria {
  id: string;
  requirementId: string;
  scenario: string;
  given: string[];
  when: string;
  then: string[];
  and?: string[];
  scenarioType: string;
  status: string;
  testedById?: string;
  testedAt?: Date;
  testEvidence?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 测试用例
export interface TestCase {
  id: string;
  requirementId: string;
  acceptanceCriteriaId?: string;
  title: string;
  description?: string;
  preconditions: string[];
  testSteps: Array<{ step: string; data?: string; expected: string }>;
  testData?: any;
  automationStatus: string;
  automationScript?: string;
  automationFramework?: string;
  lastRunStatus?: string;
  lastRunAt?: Date;
  lastRunById?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 业务规则
export interface BusinessRule {
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
  verificationStatus: string;
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

// 验收签名
export interface AcceptanceSignoff {
  id: string;
  requirementId: string;
  signoffType: string;
  signoffStatus: string;
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
