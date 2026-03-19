import type { RequirementStatus, RequirementPriority, RequirementType, AcceptanceCriteriaStatus, TestCaseAutomationStatus, TestCaseRunStatus, NFRVerificationStatus, AcceptanceSignoffStatus } from '@oops-ai/shared/src/models/requirement';

// 需求状态映射
export const requirementStatusMap: Record<RequirementStatus, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  REVIEWING: '审核中',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  IMPLEMENTING: '实施中',
  TESTING: '测试中',
  COMPLETED: '已完成',
  CANCELED: '已取消'
};

// 需求优先级映射
export const requirementPriorityMap: Record<RequirementPriority, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急'
};

// 需求类型映射
export const requirementTypeMap: Record<RequirementType, string> = {
  FEATURE: '功能需求',
  BUGFIX: 'Bug修复',
  ENHANCEMENT: '功能增强',
  TASK: '任务',
  NON_FUNCTIONAL: '非功能需求'
};

// 验收标准状态映射
export const acceptanceCriteriaStatusMap: Record<AcceptanceCriteriaStatus, string> = {
  NOT_TESTED: '未测试',
  PASS: '通过',
  FAIL: '失败',
  BLOCKED: '阻塞',
  IN_PROGRESS: '测试中'
};

// 测试用例自动化状态映射
export const testCaseAutomationStatusMap: Record<TestCaseAutomationStatus, string> = {
  MANUAL: '手动',
  AUTOMATED: '自动化',
  PARTIALLY_AUTOMATED: '部分自动化',
  NOT_AUTOMATABLE: '不可自动化'
};

// 测试用例运行状态映射
export const testCaseRunStatusMap: Record<TestCaseRunStatus, string> = {
  PASS: '通过',
  FAIL: '失败',
  BLOCKED: '阻塞',
  SKIPPED: '跳过',
  IN_PROGRESS: '进行中'
};

// NFR验证状态映射
export const nfrVerificationStatusMap: Record<NFRVerificationStatus, string> = {
  NOT_VERIFIED: '未验证',
  PASSED: '通过',
  WARNING: '警告',
  FAILED: '失败',
  IN_PROGRESS: '验证中'
};

// 验收签名状态映射
export const acceptanceSignoffStatusMap: Record<AcceptanceSignoffStatus, string> = {
  PENDING: '待签核',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  CONDITIONAL: '有条件批准'
};
