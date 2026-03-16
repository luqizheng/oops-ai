import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateRequirementDto,
  UpdateRequirementDto,
  AnalyzeFuzzyWordsDto,
  GenerateQuestionsDto,
  GenerateUserStoriesDto,
  GenerateAcceptanceCriteriaDto,
  QualityScoreDto,
  FuzzyWordAnalysis,
  QuestionItem,
  UserStory,
  AcceptanceCriterion,
  QualityScore,
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
    const prompt = `请将以下一句话需求转换为标准用户故事格式："作为[角色]，我想要[功能]，以便[价值]"

原始需求：${generateUserStoriesDto.userInput}

请输出JSON格式，包含userStories数组，每个故事包含role、feature、value字段。`

    const response = await this.llmService.generateCompletion(prompt)
    
    try {
      const parsed = JSON.parse(response)
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

  async generateAcceptanceCriteria(
    generateAcceptanceCriteriaDto: GenerateAcceptanceCriteriaDto,
  ): Promise<{ acceptanceCriteria: AcceptanceCriterion[] }> {
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
}
