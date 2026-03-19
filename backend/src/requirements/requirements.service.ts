import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateRequirementDto,
  UpdateRequirementDto,
  CreateRawRequirementDto,
  UpdateRawRequirementDto,
  CreateUserStoryDto,
  UpdateUserStoryDto,
  CreateAcceptanceCriteriaDto,
  UpdateAcceptanceCriteriaDto,
  CreateTestCaseDto,
  UpdateTestCaseDto,
  CreateBusinessRuleDto,
  UpdateBusinessRuleDto,
  CreateNFRRequirementDto,
  UpdateNFRRequirementDto,
  CreateRequirementDependencyDto,
  UpdateRequirementDependencyDto,
  CreateAcceptanceSignoffDto,
  UpdateAcceptanceSignoffDto,
  CreateRequirementDefinitionDto,
  UpdateRequirementDefinitionDto,
} from './dto/requirements.dto'
import { VectorService } from '../vector/vector.service'

@Injectable()
export class RequirementsService {
  constructor(
    private prisma: PrismaService,
    private vectorService: VectorService,
  ) {}

  async create(userId: string, createRequirementDto: CreateRequirementDto) {
    const requirement = await this.prisma.requirement.create({
      data: {
        title: createRequirementDto.title,
        description: createRequirementDto.description,
        rawInput: createRequirementDto.rawInput,
        projectId: createRequirementDto.projectId,
        status: createRequirementDto.status || 'draft',
        priority: createRequirementDto.priority || 'medium',
        storyPoints: createRequirementDto.storyPoints,
        assigneeId: createRequirementDto.assigneeId,
        reporterId: userId,
      },
    })

    const embedding = await this.vectorService.generateEmbedding(
      `${createRequirementDto.title} ${createRequirementDto.description || ''}`,
    )

    await this.prisma.requirement.update({
      where: { id: requirement.id },
      data: { vectorEmbedding: JSON.stringify(embedding) },
    })

    await this.vectorService.addRequirement(requirement.id, embedding)

    return requirement
  }

  async findAll() {
    return this.prisma.requirement.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
    })

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`)
    }

    return requirement
  }

  async update(id: string, updateRequirementDto: UpdateRequirementDto) {
    const requirement = await this.findOne(id)

    const updatedRequirement = await this.prisma.requirement.update({
      where: { id },
      data: {
        title: updateRequirementDto.title || requirement.title,
        description: updateRequirementDto.description || requirement.description,
        structuredData: updateRequirementDto.structuredData,
        qualityScore: updateRequirementDto.qualityScore,
        status: updateRequirementDto.status || requirement.status,
        priority: updateRequirementDto.priority || requirement.priority,
        storyPoints: updateRequirementDto.storyPoints || requirement.storyPoints,
        assigneeId: updateRequirementDto.assigneeId || requirement.assigneeId,
        dueDate: updateRequirementDto.dueDate || requirement.dueDate,
      },
    })

    if (updateRequirementDto.title || updateRequirementDto.description) {
      const embedding = await this.vectorService.generateEmbedding(
        `${updatedRequirement.title} ${updatedRequirement.description || ''}`,
      )
      await this.vectorService.updateRequirement(id, embedding)
    }

    return updatedRequirement
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.vectorService.removeRequirement(id)
    return this.prisma.requirement.delete({ where: { id } })
  }

  async findByProject(projectId: string) {
    return this.prisma.requirement.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: true,
        reporter: true,
      },
    })
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id)
    return this.prisma.requirement.update({
      where: { id },
      data: { status },
    })
  }

  async assign(id: string, assigneeId: string) {
    await this.findOne(id)
    return this.prisma.requirement.update({
      where: { id },
      data: { assigneeId },
    })
  }

  // ============================================
  // 1. 原始需求 (Raw Need) 相关方法
  // ============================================

  async createRawRequirement(projectId: string, createRawRequirementDto: CreateRawRequirementDto) {
    return this.prisma.rawRequirement.create({
      data: {
        ...createRawRequirementDto,
        proposedAt: createRawRequirementDto.proposedAt || new Date(),
        projectId,
      },
    })
  }

  async getRawRequirements(projectId: string) {
    return this.prisma.rawRequirement.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getRawRequirementById(rawRequirementId: string) {
    const rawRequirement = await this.prisma.rawRequirement.findUnique({
      where: { id: rawRequirementId },
    })

    if (!rawRequirement) {
      throw new NotFoundException(`Raw requirement with ID ${rawRequirementId} not found`)
    }

    return rawRequirement
  }

  async updateRawRequirement(
    rawRequirementId: string,
    updateRawRequirementDto: UpdateRawRequirementDto,
  ) {
    await this.getRawRequirementById(rawRequirementId)
    return this.prisma.rawRequirement.update({
      where: { id: rawRequirementId },
      data: updateRawRequirementDto,
    })
  }

  async deleteRawRequirement(rawRequirementId: string) {
    await this.getRawRequirementById(rawRequirementId)
    return this.prisma.rawRequirement.delete({
      where: { id: rawRequirementId },
    })
  }

  // ============================================
  // 2. 用户故事 (User Story) 相关方法
  // ============================================

  async createUserStory(requirementId: string, createUserStoryDto: CreateUserStoryDto) {
    await this.findOne(requirementId)
    return this.prisma.userStory.create({
      data: {
        ...createUserStoryDto,
        requirementId,
      },
    })
  }

  async getUserStories(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.userStory.findMany({
      where: { requirementId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getUserStoryById(userStoryId: string) {
    const userStory = await this.prisma.userStory.findUnique({
      where: { id: userStoryId },
    })

    if (!userStory) {
      throw new NotFoundException(`User story with ID ${userStoryId} not found`)
    }

    return userStory
  }

  async updateUserStory(userStoryId: string, updateUserStoryDto: UpdateUserStoryDto) {
    await this.getUserStoryById(userStoryId)
    return this.prisma.userStory.update({
      where: { id: userStoryId },
      data: updateUserStoryDto,
    })
  }

  async deleteUserStory(userStoryId: string) {
    await this.getUserStoryById(userStoryId)
    return this.prisma.userStory.delete({
      where: { id: userStoryId },
    })
  }

  // ============================================
  // 3. 验收标准 (Acceptance Criteria) 相关方法
  // ============================================

  async createAcceptanceCriteria(
    requirementId: string,
    createAcceptanceCriteriaDto: CreateAcceptanceCriteriaDto,
  ) {
    await this.findOne(requirementId)
    return this.prisma.acceptanceCriteria.create({
      data: {
        ...createAcceptanceCriteriaDto,
        requirementId,
      },
    })
  }

  async getAcceptanceCriteria(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.acceptanceCriteria.findMany({
      where: { requirementId },
      orderBy: { createdAt: 'desc' },
      include: {
        testCases: true,
      },
    })
  }

  async getAcceptanceCriterionById(criteriaId: string) {
    const criteria = await this.prisma.acceptanceCriteria.findUnique({
      where: { id: criteriaId },
    })

    if (!criteria) {
      throw new NotFoundException(`Acceptance criterion with ID ${criteriaId} not found`)
    }

    return criteria
  }

  async updateAcceptanceCriteria(
    criteriaId: string,
    updateAcceptanceCriteriaDto: UpdateAcceptanceCriteriaDto,
  ) {
    await this.getAcceptanceCriterionById(criteriaId)
    return this.prisma.acceptanceCriteria.update({
      where: { id: criteriaId },
      data: updateAcceptanceCriteriaDto,
    })
  }

  async deleteAcceptanceCriteria(criteriaId: string) {
    await this.getAcceptanceCriterionById(criteriaId)
    return this.prisma.acceptanceCriteria.delete({
      where: { id: criteriaId },
    })
  }

  // ============================================
  // 4. 测试用例 (Test Cases) 相关方法
  // ============================================

  async createTestCase(requirementId: string, createTestCaseDto: CreateTestCaseDto) {
    await this.findOne(requirementId)
    return this.prisma.testCase.create({
      data: {
        ...createTestCaseDto,
        requirementId,
      },
    })
  }

  async getTestCases(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.testCase.findMany({
      where: { requirementId },
      orderBy: { createdAt: 'desc' },
      include: {
        acceptanceCriteria: true,
        testExecutions: true,
      },
    })
  }

  async getTestCaseById(testCaseId: string) {
    const testCase = await this.prisma.testCase.findUnique({
      where: { id: testCaseId },
    })

    if (!testCase) {
      throw new NotFoundException(`Test case with ID ${testCaseId} not found`)
    }

    return testCase
  }

  async updateTestCase(testCaseId: string, updateTestCaseDto: UpdateTestCaseDto) {
    await this.getTestCaseById(testCaseId)
    return this.prisma.testCase.update({
      where: { id: testCaseId },
      data: updateTestCaseDto,
    })
  }

  async deleteTestCase(testCaseId: string) {
    await this.getTestCaseById(testCaseId)
    return this.prisma.testCase.delete({
      where: { id: testCaseId },
    })
  }

  // ============================================
  // 5. 业务规则 (Business Rules) 相关方法
  // ============================================

  async createBusinessRule(requirementId: string, createBusinessRuleDto: CreateBusinessRuleDto) {
    await this.findOne(requirementId)
    return this.prisma.businessRule.create({
      data: {
        ...createBusinessRuleDto,
        requirementId,
      },
    })
  }

  async getBusinessRules(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.businessRule.findMany({
      where: { requirementId },
      orderBy: { priority: 'asc' },
    })
  }

  async getBusinessRuleById(ruleId: string) {
    const businessRule = await this.prisma.businessRule.findUnique({
      where: { id: ruleId },
    })

    if (!businessRule) {
      throw new NotFoundException(`Business rule with ID ${ruleId} not found`)
    }

    return businessRule
  }

  async updateBusinessRule(ruleId: string, updateBusinessRuleDto: UpdateBusinessRuleDto) {
    await this.getBusinessRuleById(ruleId)
    return this.prisma.businessRule.update({
      where: { id: ruleId },
      data: updateBusinessRuleDto,
    })
  }

  async deleteBusinessRule(ruleId: string) {
    await this.getBusinessRuleById(ruleId)
    return this.prisma.businessRule.delete({
      where: { id: ruleId },
    })
  }

  // ============================================
  // 6. 非功能需求 (Non-functional Requirements) 相关方法
  // ============================================

  async createNFRRequirement(
    requirementId: string,
    createNFRRequirementDto: CreateNFRRequirementDto,
  ) {
    await this.findOne(requirementId)
    return this.prisma.nFRRequirement.create({
      data: {
        ...createNFRRequirementDto,
        requirementId,
      },
    })
  }

  async getNFRRequirements(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.nFRRequirement.findMany({
      where: { requirementId },
      orderBy: { nfrType: 'asc' },
    })
  }

  async getNFRRequirementById(nfrId: string) {
    const nfrRequirement = await this.prisma.nFRRequirement.findUnique({
      where: { id: nfrId },
    })

    if (!nfrRequirement) {
      throw new NotFoundException(`NFR requirement with ID ${nfrId} not found`)
    }

    return nfrRequirement
  }

  async updateNFRRequirement(nfrId: string, updateNFRRequirementDto: UpdateNFRRequirementDto) {
    await this.getNFRRequirementById(nfrId)
    return this.prisma.nFRRequirement.update({
      where: { id: nfrId },
      data: updateNFRRequirementDto,
    })
  }

  async deleteNFRRequirement(nfrId: string) {
    await this.getNFRRequirementById(nfrId)
    return this.prisma.nFRRequirement.delete({
      where: { id: nfrId },
    })
  }

  // ============================================
  // 7. 依赖关系 (Dependencies) 相关方法
  // ============================================

  async createDependency(
    requirementId: string,
    createDependencyDto: CreateRequirementDependencyDto,
  ) {
    await this.findOne(requirementId)
    await this.findOne(createDependencyDto.dependsOnId)
    return this.prisma.requirementDependency.create({
      data: {
        requirementId,
        dependsOnId: createDependencyDto.dependsOnId,
        dependencyType: createDependencyDto.dependencyType,
        description: createDependencyDto.description,
        strength: createDependencyDto.strength,
      },
    })
  }

  async getDependencies(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.requirementDependency.findMany({
      where: { requirementId },
      include: {
        dependsOn: true,
      },
    })
  }

  async getDependencyById(dependencyId: string) {
    const dependency = await this.prisma.requirementDependency.findUnique({
      where: { id: dependencyId },
    })

    if (!dependency) {
      throw new NotFoundException(`Dependency with ID ${dependencyId} not found`)
    }

    return dependency
  }

  async updateDependency(
    dependencyId: string,
    updateDependencyDto: UpdateRequirementDependencyDto,
  ) {
    await this.getDependencyById(dependencyId)
    return this.prisma.requirementDependency.update({
      where: { id: dependencyId },
      data: updateDependencyDto,
    })
  }

  async deleteDependency(dependencyId: string) {
    await this.getDependencyById(dependencyId)
    return this.prisma.requirementDependency.delete({
      where: { id: dependencyId },
    })
  }

  // ============================================
  // 8. 验收签名 (Acceptance Sign-off) 相关方法
  // ============================================

  async createAcceptanceSignoff(
    requirementId: string,
    userId: string,
    createAcceptanceSignoffDto: CreateAcceptanceSignoffDto,
  ) {
    await this.findOne(requirementId)
    return this.prisma.acceptanceSignoff.create({
      data: {
        ...createAcceptanceSignoffDto,
        requirementId,
        signedById: userId,
        signedAt: new Date(),
        signoffStatus: 'approved',
      },
    })
  }

  async getAcceptanceSignoffs(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.acceptanceSignoff.findMany({
      where: { requirementId },
      include: {
        signedBy: true,
      },
    })
  }

  async getAcceptanceSignoffById(signoffId: string) {
    const signoff = await this.prisma.acceptanceSignoff.findUnique({
      where: { id: signoffId },
    })

    if (!signoff) {
      throw new NotFoundException(`Acceptance signoff with ID ${signoffId} not found`)
    }

    return signoff
  }

  async updateAcceptanceSignoff(
    signoffId: string,
    userId: string,
    updateAcceptanceSignoffDto: UpdateAcceptanceSignoffDto,
  ) {
    await this.getAcceptanceSignoffById(signoffId)
    return this.prisma.acceptanceSignoff.update({
      where: { id: signoffId },
      data: {
        ...updateAcceptanceSignoffDto,
        signedById: userId,
        signedAt: new Date(),
      },
    })
  }

  async deleteAcceptanceSignoff(signoffId: string) {
    await this.getAcceptanceSignoffById(signoffId)
    return this.prisma.acceptanceSignoff.delete({
      where: { id: signoffId },
    })
  }

  // ============================================
  // 9. 需求定义 (Requirement Definition) 相关方法
  // ============================================

  async createRequirementDefinition(
    requirementId: string,
    userId: string,
    createRequirementDefinitionDto: CreateRequirementDefinitionDto,
  ) {
    await this.findOne(requirementId)

    // 检查是否已经存在该需求的最新版本定义
    const latestDefinition = await this.prisma.requirementDefinition.findFirst({
      where: { requirementId },
      orderBy: { version: 'desc' },
    })

    const newVersion = latestDefinition ? latestDefinition.version + 1 : 1

    return this.prisma.requirementDefinition.create({
      data: {
        ...createRequirementDefinitionDto,
        requirementId,
        definedById: userId,
        definedAt: new Date(),
        version: newVersion,
        changeHistory: [
          {
            version: newVersion,
            changedBy: userId,
            changedAt: new Date(),
            changeDescription: 'Initial version created',
          },
        ],
      },
    })
  }

  async getRequirementDefinitions(requirementId: string) {
    await this.findOne(requirementId)
    return this.prisma.requirementDefinition.findMany({
      where: { requirementId },
      orderBy: { version: 'desc' },
      include: {
        definedBy: true,
        lastUpdatedBy: true,
      },
    })
  }

  async getRequirementDefinitionById(definitionId: string) {
    const definition = await this.prisma.requirementDefinition.findUnique({
      where: { id: definitionId },
      include: {
        definedBy: true,
        lastUpdatedBy: true,
      },
    })

    if (!definition) {
      throw new NotFoundException(`Requirement definition with ID ${definitionId} not found`)
    }

    return definition
  }

  async getLatestRequirementDefinition(requirementId: string) {
    await this.findOne(requirementId)
    // 获取最新版本的需求定义
    return this.prisma.requirementDefinition.findFirst({
      where: { requirementId },
      orderBy: { version: 'desc' },
      include: {
        definedBy: true,
        lastUpdatedBy: true,
      },
    })
  }

  async updateRequirementDefinition(
    definitionId: string,
    userId: string,
    updateRequirementDefinitionDto: UpdateRequirementDefinitionDto,
  ) {
    // 检查是否存在该需求定义
    const existingDefinition = await this.getRequirementDefinitionById(definitionId)

    // 创建新版本
    return this.prisma.requirementDefinition.create({
      data: {
        requirementId: existingDefinition.requirementId,
        title: updateRequirementDefinitionDto.title || existingDefinition.title,
        detailedDescription:
          updateRequirementDefinitionDto.detailedDescription ||
          existingDefinition.detailedDescription,
        acceptanceCriteria:
          updateRequirementDefinitionDto.acceptanceCriteria ||
          existingDefinition.acceptanceCriteria,
        businessRules:
          updateRequirementDefinitionDto.businessRules || existingDefinition.businessRules,
        dependencies:
          updateRequirementDefinitionDto.dependencies || existingDefinition.dependencies,
        assumptions: updateRequirementDefinitionDto.assumptions || existingDefinition.assumptions,
        constraints: updateRequirementDefinitionDto.constraints || existingDefinition.constraints,
        riskNotes: updateRequirementDefinitionDto.riskNotes || existingDefinition.riskNotes,
        estimatedEffort:
          updateRequirementDefinitionDto.estimatedEffort || existingDefinition.estimatedEffort,
        estimatedCost:
          updateRequirementDefinitionDto.estimatedCost || existingDefinition.estimatedCost,
        status: updateRequirementDefinitionDto.status || existingDefinition.status,
        version: existingDefinition.version + 1,
        definedById: existingDefinition.definedById, // 保持原始创建者
        definedAt: existingDefinition.definedAt, // 保持原始创建时间
        lastUpdatedById: userId,
        lastUpdatedAt: new Date(),
        changeHistory: [
          ...((existingDefinition.changeHistory as any[]) || []),
          {
            version: existingDefinition.version + 1,
            changedBy: userId,
            changedAt: new Date(),
            changeDescription:
              updateRequirementDefinitionDto.changeDescription || 'Updated definition',
          },
        ],
      },
    })
  }

  async deleteRequirementDefinition(definitionId: string) {
    await this.getRequirementDefinitionById(definitionId)
    return this.prisma.requirementDefinition.delete({
      where: { id: definitionId },
    })
  }

  // ============================================
  // 需求详情获取方法（包含所有关联信息）
  // ============================================

  async getRequirementDetails(requirementId: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId },
      include: {
        rawRequirement: true,
        userStories: true,
        acceptanceCriteria: {
          include: {
            testCases: true,
          },
        },
        testCases: true,
        businessRules: true,
        nfrRequirements: true,
        requirementDeps: {
          include: {
            dependsOn: true,
          },
        },
        dependentReqs: true,
        acceptanceSignoffs: {
          include: {
            signedBy: true,
          },
        },
        requirementDefinitions: {
          include: {
            definedBy: true,
            lastUpdatedBy: true,
          },
          orderBy: { version: 'desc' },
        },
        assignee: true,
        reporter: true,
      },
    })

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${requirementId} not found`)
    }

    return requirement
  }
}
