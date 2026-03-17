import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateRequirementDto,
  UpdateRequirementDto,
  AnalyzeFuzzyWordsDto,
  AnalyzeRequirementDto,
  GenerateQuestionsDto,
  GenerateUserStoriesDto,
  GenerateAcceptanceCriteriaDto,
  QualityScoreDto,
  FuzzyWordAnalysis,
  QuestionItem,
  UserStory,
  AcceptanceCriterion,
  QualityScore,
  RequirementAnalysisResponse,
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
} from './dto/requirements.dto'
import { LLMService } from '../llm/llm.service'
import { VectorService } from '../vector/vector.service'

@Injectable()
export class RequirementsService {
  constructor(
    private prisma: PrismaService,
    private llmService: LLMService,
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
    const requirement = await this.findOne(id)
    return this.prisma.requirement.update({
      where: { id },
      data: { status },
    })
  }

  async assign(id: string, assigneeId: string) {
    const requirement = await this.findOne(id)
    return this.prisma.requirement.update({
      where: { id },
      data: { assigneeId },
    })
  }

  async analyzeFuzzyWords(analyzeFuzzyWordsDto: AnalyzeFuzzyWordsDto): Promise<FuzzyWordAnalysis> {
    const fuzzyWords = [
      '快速',
      '友好',
      '强大',
      '简单',
      '高效',
      'nice',
      'fast',
      'easy',
      'user-friendly',
      'intuitive',
      'responsive',
      'scalable',
      'robust',
      'seamless',
      'smooth',
    ]

    const foundFuzzyWords: Array<{
      word: string
      positions: Array<{ start: number; end: number }>
    }> = []

    const text = analyzeFuzzyWordsDto.text.toLowerCase()

    fuzzyWords.forEach((word) => {
      const lowerWord = word.toLowerCase()
      let startIndex = text.indexOf(lowerWord)
      while (startIndex !== -1) {
        const endIndex = startIndex + lowerWord.length
        foundFuzzyWords.push({
          word,
          positions: [{ start: startIndex, end: endIndex }],
        })
        startIndex = text.indexOf(lowerWord, endIndex)
      }
    })

    const suggestion =
      foundFuzzyWords.length > 0
        ? `发现 ${foundFuzzyWords.length} 个模糊词，建议用量化指标替代。例如："快速"可以改为"响应时间<2秒"`
        : '未发现模糊词，需求描述清晰。'

    return {
      text: analyzeFuzzyWordsDto.text,
      fuzzyWords: foundFuzzyWords,
      suggestion,
    }
  }

  async generateQuestions(
    generateQuestionsDto: GenerateQuestionsDto,
  ): Promise<{ questions: QuestionItem[] }> {
    const prompt = `你是一个资深产品经理，请根据以下需求类型和内容，生成3-5个针对性追问，帮助完善需求：

需求类型：${generateQuestionsDto.requirementType}
需求内容：${generateQuestionsDto.requirementContent}

请输出JSON格式，包含questions数组，每个问题包含question和type字段。`

    const response = await this.llmService.generateCompletion(prompt)

    try {
      const parsed = JSON.parse(response)
      return { questions: parsed.questions || [] }
    } catch {
      const questions = response
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => ({
          question: line.replace(/^\d+\.\s*/, '').trim(),
          type: 'clarification',
        }))
      return { questions: questions.slice(0, 5) }
    }
  }

  async generateUserStories(
    generateUserStoriesDto: GenerateUserStoriesDto,
  ): Promise<{ userStories: UserStory[] }> {
    try {
      const response = await this.llmService.generateCompletionWithTemplate(
        'requirement-to-story',
        { requirement: generateUserStoriesDto.userInput },
      )

      console.log('调用 llm之后，返回的:', response)

      // 去除响应开头的 ```json 和结尾的 ``` 标记
      const cleanedResponse = response.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      const parsed = JSON.parse(cleanedResponse)
      return { userStories: parsed.userStories || [] }
    } catch (error) {
      console.error('生成用户故事失败:', error)

      // 回退到直接调用
      const prompt = `请将以下一句话需求转换为标准用户故事格式："作为[角色]，我想要[功能]，以便[价值]"

原始需求：${generateUserStoriesDto.userInput}

请输出JSON格式，包含userStories数组，每个故事包含role、feature、value字段。`

      const response = await this.llmService.generateCompletion(prompt)

      try {
        const cleanedResponse = response.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        const parsed = JSON.parse(cleanedResponse)
        return { userStories: parsed.userStories || [] }
      } catch {
        const stories = response
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            const match = line.match(/作为\[(.+?)\]，我想要\[(.+?)\]，以便\[(.+?)\]/)
            if (match) {
              return {
                role: match[1],
                feature: match[2],
                value: match[3],
              }
            }
            return null
          })
          .filter(Boolean)

        return { userStories: stories.slice(0, 3) }
      }
    }
  }

  async generateAcceptanceCriteria(
    generateAcceptanceCriteriaDto: GenerateAcceptanceCriteriaDto,
  ): Promise<{ acceptanceCriteria: AcceptanceCriterion[] }> {
    try {
      const response = await this.llmService.generateCompletionWithTemplate('generate-acceptance', {
        requirementContent: generateAcceptanceCriteriaDto.requirementContent,
      })

      try {
        const parsed = JSON.parse(response)
        return { acceptanceCriteria: parsed.acceptanceCriteria || [] }
      } catch {
        // 回退到直接解析
        const criteria = response
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            const match = line.match(/Given (.+?) When (.+?) Then (.+?)$/)
            if (match) {
              return {
                given: match[1],
                when: match[2],
                then: match[3],
                scenarioType: 'normal' as const,
              }
            }
            return null
          })
          .filter(Boolean) as Array<{
          given: string
          when: string
          then: string
          scenarioType: 'normal' | 'exception' | 'boundary'
        }>

        return { acceptanceCriteria: criteria.slice(0, 5) }
      }
    } catch (error) {
      console.error('生成验收标准失败:', error)

      // 回退到直接调用
      const prompt = `请为以下需求生成3-5个Given-When-Then格式的验收条件，覆盖正常流程、异常流程和边界条件：

需求内容：${generateAcceptanceCriteriaDto.requirementContent}

请输出JSON格式，包含acceptanceCriteria数组，每个条件包含given、when、then、scenarioType字段。`

      const response = await this.llmService.generateCompletion(prompt)

      try {
        const parsed = JSON.parse(response)
        return { acceptanceCriteria: parsed.acceptanceCriteria || [] }
      } catch {
        const criteria = response
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            const match = line.match(/Given (.+?) When (.+?) Then (.+?)$/)
            if (match) {
              return {
                given: match[1],
                when: match[2],
                then: match[3],
                scenarioType: 'normal' as const,
              }
            }
            return null
          })
          .filter(Boolean) as Array<{
          given: string
          when: string
          then: string
          scenarioType: 'normal' | 'exception' | 'boundary'
        }>

        return { acceptanceCriteria: criteria.slice(0, 5) }
      }
    }
  }

  async qualityScore(qualityScoreDto: QualityScoreDto): Promise<QualityScore> {
    const text = qualityScoreDto.text

    const clarityScore = this.calculateClarityScore(text)
    const testabilityScore = this.calculateTestabilityScore(text)
    const completenessScore = this.calculateCompletenessScore(text)

    const totalScore = Math.round((clarityScore + testabilityScore + completenessScore) / 3)

    const suggestions = this.generateSuggestions(
      clarityScore,
      testabilityScore,
      completenessScore,
      text,
    )

    return {
      clarity: clarityScore,
      testability: testabilityScore,
      completeness: completenessScore,
      totalScore,
      suggestions,
    }
  }

  private calculateClarityScore(text: string): number {
    const fuzzyWords = ['快速', '友好', '强大', '简单', '高效', 'nice', 'fast', 'easy']
    const words = text.split(/\s+/)
    const fuzzyCount = fuzzyWords.reduce((count, word) => {
      return count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0)
    }, 0)

    const fuzzyRatio = fuzzyCount / fuzzyWords.length
    return Math.max(0, Math.min(10, Math.round(10 - fuzzyRatio * 10)))
  }

  private calculateTestabilityScore(text: string): number {
    const testableIndicators = [
      '当',
      '如果',
      '则',
      '应该',
      '必须',
      '验证',
      '检查',
      '确认',
      '测试',
      '验收',
    ]

    const hasNumbers = /\d+/.test(text)
    const hasConditions = testableIndicators.some((indicator) => text.includes(indicator))
    const hasAcceptance = text.includes('验收') || text.includes('测试')

    let score = 5
    if (hasNumbers) score += 2
    if (hasConditions) score += 2
    if (hasAcceptance) score += 1

    return Math.min(10, score)
  }

  private calculateCompletenessScore(text: string): number {
    const completenessIndicators = [
      '谁',
      '什么',
      '何时',
      '哪里',
      '为什么',
      '如何',
      '角色',
      '功能',
      '价值',
      '目标',
    ]

    const wordCount = text.split(/\s+/).length
    const hasMultipleSentences = (text.match(/[.!?]/g) || []).length >= 2
    const hasKeyElements = completenessIndicators.some((indicator) =>
      text.toLowerCase().includes(indicator.toLowerCase()),
    )

    let score = 5
    if (wordCount > 20) score += 2
    if (hasMultipleSentences) score += 2
    if (hasKeyElements) score += 1

    return Math.min(10, score)
  }

  private generateSuggestions(
    clarityScore: number,
    testabilityScore: number,
    completenessScore: number,
    text: string,
  ): string[] {
    const suggestions: string[] = []

    if (clarityScore < 7) {
      suggestions.push('需求中存在模糊词汇，建议用量化指标替代模糊描述')
    }

    if (testabilityScore < 7) {
      suggestions.push('需求可测试性不足，建议添加具体的验收条件和测试场景')
    }

    if (completenessScore < 7) {
      suggestions.push('需求完整性有待提高，建议补充角色、功能、价值等关键要素')
    }

    if (clarityScore >= 8 && testabilityScore >= 8 && completenessScore >= 8) {
      suggestions.push('需求质量良好，可以直接进入下一阶段')
    }

    return suggestions
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
        assignee: true,
        reporter: true,
      },
    })

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${requirementId} not found`)
    }

    return requirement
  }

  // ============================================
  // AI需求分析方法
  // ============================================

  async analyzeRequirement(
    analyzeRequirementDto: AnalyzeRequirementDto,
  ): Promise<RequirementAnalysisResponse> {
    const prompt = `你是一个资深产品经理，请分析以下原始需求，将其拆解为具体的功能点，并生成需要追问的问题：

原始需求：${analyzeRequirementDto.requirementText}

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
}`

    try {
      const response = await this.llmService.generateCompletion(prompt)

      // 尝试解析JSON响应
      try {
        const parsed = JSON.parse(response)
        return {
          analysisResults: parsed.analysisResults || [],
          questions: parsed.questions || [],
        }
      } catch (jsonError) {
        // 如果JSON解析失败，尝试从文本中提取
        console.warn('Failed to parse JSON response, trying to extract from text:', response)

        // 简单的文本提取逻辑
        const analysisResults: string[] = []
        const questions: string[] = []

        const lines = response.split('\n')
        let inAnalysisResults = false
        let inQuestions = false

        for (const line of lines) {
          const trimmedLine = line.trim()

          if (trimmedLine.includes('analysisResults') || trimmedLine.includes('需求点')) {
            inAnalysisResults = true
            inQuestions = false
            continue
          }

          if (trimmedLine.includes('questions') || trimmedLine.includes('追问')) {
            inAnalysisResults = false
            inQuestions = true
            continue
          }

          if (
            inAnalysisResults &&
            trimmedLine &&
            !trimmedLine.includes('{') &&
            !trimmedLine.includes('}') &&
            !trimmedLine.includes('[') &&
            !trimmedLine.includes(']')
          ) {
            const cleanLine = trimmedLine
              .replace(/^[-\*•]\s*/, '')
              .replace(/["',]/g, '')
              .trim()
            if (cleanLine) {
              analysisResults.push(cleanLine)
            }
          }

          if (
            inQuestions &&
            trimmedLine &&
            !trimmedLine.includes('{') &&
            !trimmedLine.includes('}') &&
            !trimmedLine.includes('[') &&
            !trimmedLine.includes(']')
          ) {
            const cleanLine = trimmedLine
              .replace(/^[-\*•]\s*/, '')
              .replace(/["',]/g, '')
              .trim()
            if (cleanLine) {
              questions.push(cleanLine)
            }
          }
        }

        // 如果没有提取到结果，使用默认值
        if (analysisResults.length === 0) {
          analysisResults.push('需求分析失败，请重试')
        }

        return {
          analysisResults,
          questions,
        }
      }
    } catch (error) {
      console.error('Error in AI requirement analysis:', error)
      throw new BadRequestException(`AI分析失败: ${error.message}`)
    }
  }
}
