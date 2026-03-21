
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RequirementScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  rawRequirementId: 'rawRequirementId',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  storyPoints: 'storyPoints',
  rawInput: 'rawInput',
  structuredData: 'structuredData',
  qualityScore: 'qualityScore',
  vectorEmbedding: 'vectorEmbedding',
  assigneeId: 'assigneeId',
  reporterId: 'reporterId',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RawRequirementScalarFieldEnum = {
  id: 'id',
  content: 'content',
  sourceType: 'sourceType',
  sourceMeta: 'sourceMeta',
  proposedBy: 'proposedBy',
  proposedAt: 'proposedAt',
  scenario: 'scenario',
  projectId: 'projectId',
  createdAt: 'createdAt'
};

exports.Prisma.UserStoryScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  role: 'role',
  want: 'want',
  soThat: 'soThat',
  acceptanceNotes: 'acceptanceNotes',
  storyPoints: 'storyPoints',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AcceptanceCriteriaScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  scenario: 'scenario',
  given: 'given',
  when: 'when',
  then: 'then',
  and: 'and',
  scenarioType: 'scenarioType',
  status: 'status',
  testedById: 'testedById',
  testedAt: 'testedAt',
  testEvidence: 'testEvidence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TestCaseScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  acceptanceCriteriaId: 'acceptanceCriteriaId',
  title: 'title',
  description: 'description',
  preconditions: 'preconditions',
  testSteps: 'testSteps',
  testData: 'testData',
  automationStatus: 'automationStatus',
  automationScript: 'automationScript',
  automationFramework: 'automationFramework',
  lastRunStatus: 'lastRunStatus',
  lastRunAt: 'lastRunAt',
  lastRunById: 'lastRunById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TestExecutionScalarFieldEnum = {
  id: 'id',
  testCaseId: 'testCaseId',
  status: 'status',
  duration: 'duration',
  errorMessage: 'errorMessage',
  screenshotUrls: 'screenshotUrls',
  logUrls: 'logUrls',
  executedById: 'executedById',
  executedAt: 'executedAt',
  environment: 'environment',
  buildVersion: 'buildVersion'
};

exports.Prisma.BusinessRuleScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  ruleId: 'ruleId',
  ruleName: 'ruleName',
  ruleType: 'ruleType',
  ruleExpression: 'ruleExpression',
  ruleDescription: 'ruleDescription',
  condition: 'condition',
  action: 'action',
  elseAction: 'elseAction',
  effectiveFrom: 'effectiveFrom',
  effectiveTo: 'effectiveTo',
  priority: 'priority',
  affectedModules: 'affectedModules',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NFRRequirementScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  nfrType: 'nfrType',
  metric: 'metric',
  targetValue: 'targetValue',
  unit: 'unit',
  comparison: 'comparison',
  warningThreshold: 'warningThreshold',
  criticalThreshold: 'criticalThreshold',
  measurementMethod: 'measurementMethod',
  measurementTool: 'measurementTool',
  verificationStatus: 'verificationStatus',
  lastVerifiedAt: 'lastVerifiedAt',
  lastVerifiedValue: 'lastVerifiedValue',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequirementDependencyScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  dependsOnId: 'dependsOnId',
  dependencyType: 'dependencyType',
  description: 'description',
  strength: 'strength',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AcceptanceSignoffScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  signoffType: 'signoffType',
  signoffStatus: 'signoffStatus',
  signedById: 'signedById',
  signedAt: 'signedAt',
  signoffEvidence: 'signoffEvidence',
  comments: 'comments',
  criteriaIds: 'criteriaIds',
  milestone: 'milestone',
  releaseVersion: 'releaseVersion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequirementDefinitionScalarFieldEnum = {
  id: 'id',
  requirementId: 'requirementId',
  title: 'title',
  detailedDescription: 'detailedDescription',
  acceptanceCriteria: 'acceptanceCriteria',
  businessRules: 'businessRules',
  dependencies: 'dependencies',
  assumptions: 'assumptions',
  constraints: 'constraints',
  riskNotes: 'riskNotes',
  estimatedEffort: 'estimatedEffort',
  estimatedCost: 'estimatedCost',
  definedById: 'definedById',
  definedAt: 'definedAt',
  lastUpdatedById: 'lastUpdatedById',
  lastUpdatedAt: 'lastUpdatedAt',
  status: 'status',
  version: 'version',
  changeHistory: 'changeHistory',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  key: 'key',
  settings: 'settings',
  status: 'status',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectMemberScalarFieldEnum = {
  projectId: 'projectId',
  userId: 'userId',
  role: 'role',
  permissions: 'permissions',
  joinedAt: 'joinedAt'
};

exports.Prisma.ProjectSettingsScalarFieldEnum = {
  projectId: 'projectId',
  workflowConfig: 'workflowConfig',
  notificationConfig: 'notificationConfig',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  roleId: 'roleId'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  roleId: 'roleId'
};

exports.Prisma.QuestionTemplateScalarFieldEnum = {
  id: 'id',
  requirementType: 'requirementType',
  templateContent: 'templateContent',
  createdAt: 'createdAt'
};

exports.Prisma.LLMConfigurationScalarFieldEnum = {
  id: 'id',
  provider: 'provider',
  modelName: 'modelName',
  apiEndpoint: 'apiEndpoint',
  apiKey: 'apiKey',
  temperature: 'temperature',
  maxTokens: 'maxTokens',
  isDefault: 'isDefault',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PromptTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  template: 'template',
  category: 'category',
  provider: 'provider',
  modelName: 'modelName',
  isDefault: 'isDefault',
  isActive: 'isActive',
  variables: 'variables',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnalysisSessionScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  rawContent: 'rawContent',
  currentRequirements: 'currentRequirements',
  pendingQuestions: 'pendingQuestions',
  answeredQuestions: 'answeredQuestions',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Requirement: 'Requirement',
  RawRequirement: 'RawRequirement',
  UserStory: 'UserStory',
  AcceptanceCriteria: 'AcceptanceCriteria',
  TestCase: 'TestCase',
  TestExecution: 'TestExecution',
  BusinessRule: 'BusinessRule',
  NFRRequirement: 'NFRRequirement',
  RequirementDependency: 'RequirementDependency',
  AcceptanceSignoff: 'AcceptanceSignoff',
  RequirementDefinition: 'RequirementDefinition',
  Project: 'Project',
  ProjectMember: 'ProjectMember',
  ProjectSettings: 'ProjectSettings',
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  QuestionTemplate: 'QuestionTemplate',
  LLMConfiguration: 'LLMConfiguration',
  PromptTemplate: 'PromptTemplate',
  AnalysisSession: 'AnalysisSession'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
