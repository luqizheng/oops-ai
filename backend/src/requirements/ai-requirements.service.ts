import { Injectable, BadRequestException } from '@nestjs/common'
import { LLMService } from '../llm/llm.service'
import { PromptTemplateService } from '../llm/prompt-templates/prompt-template.service'
import {
  AnalyzeFuzzyWordsDto,
  AnalyzeRequirementDto,
  GenerateQuestionsDto,
  GenerateUserStoriesDto,
  GenerateAcceptanceCriteriaDto,
  QualityScoreDto,
  FuzzyWordAnalysis,
  RequirementAnalysisResponse,
  QuestionItem,
  UserStory,
  AcceptanceCriterion,
  QualityScore,
} from './dto/requirements.dto'

@Injectable()
export class AIRequirementsService {
  constructor(
    private readonly llmService: LLMService,
    private readonly promptTemplateService: PromptTemplateService,
  ) {}

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
      'better',
      'improved',
      'enhanced',
      'optimized',
      'streamlined',
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
        ? `发现 ${foundFuzzyWords.length} 个模糊词，建议用量化指标替代。例如："快速"可以改为"响应时间<2秒"，"友好"可以改为"用户满意度>90%"`
        : '未发现模糊词，需求描述清晰。'

    return {
      text: analyzeFuzzyWordsDto.text,
      fuzzyWords: foundFuzzyWords,
      suggestion,
    }
  }

  async analyzeRequirement(
    analyzeRequirementDto: AnalyzeRequirementDto,
  ): Promise<RequirementAnalysisResponse> {
    try {
      console.info('调用-analyzeRequirement')
      // 1. 获取并渲染提示词模板
      const prompt = await this.promptTemplateService.renderTemplate(
        'raw-to-requirement',
        {
          requirementText: analyzeRequirementDto.requirementText,
        },
        this.llmService,
      )

      // 2. 使用渲染后的提示词调用LLM
      const response = await this.llmService.generateCompletion(prompt)

      try {
        const content = response.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        console.info('analyzeRequirement 分析后 content:', content)
        const parsed = JSON.parse(content)

        return {
          analysisResults: parsed.analysisResults || [],
          questions: parsed.questions || [],
        }
      } catch (jsonError) {
        console.warn('Failed to parse JSON response, trying to extract from text:', response)

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

  async generateQuestions(
    generateQuestionsDto: GenerateQuestionsDto,
  ): Promise<{ questions: QuestionItem[] }> {
    // 1. 获取并渲染提示词模板
    const prompt = await this.promptTemplateService.renderTemplate(
      'generate-questions',
      {
        requirementType: generateQuestionsDto.requirementType,
        requirementContent: generateQuestionsDto.requirementContent,
      },
      this.llmService,
    )

    // 2. 使用渲染后的提示词调用LLM
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
      // 1. 获取并渲染提示词模板
      const prompt = await this.promptTemplateService.renderTemplate(
        'requirement-to-story',
        {
          requirement: generateUserStoriesDto.userInput,
        },
        this.llmService,
      )

      // 2. 使用渲染后的提示词调用LLM
      const response = await this.llmService.generateCompletion(prompt)

      console.log('调用 llm之后，返回的:', response)

      const cleanedResponse = response.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      const parsed = JSON.parse(cleanedResponse)
      return { userStories: parsed.userStories || [] }
    } catch (error) {
      console.error('生成用户故事失败:', error)
      throw new BadRequestException(`生成用户故事失败: ${error.message}`)
    }
  }

  async generateAcceptanceCriteria(
    generateAcceptanceCriteriaDto: GenerateAcceptanceCriteriaDto,
  ): Promise<{ acceptanceCriteria: AcceptanceCriterion[] }> {
    // 1. 获取并渲染提示词模板
    const prompt = await this.promptTemplateService.renderTemplate(
      'generate-acceptance',
      {
        requirementContent: generateAcceptanceCriteriaDto.requirementContent,
      },
      this.llmService,
    )

    // 2. 使用渲染后的提示词调用LLM
    const response = await this.llmService.generateCompletion(prompt)

    try {
      const parsed = JSON.parse(response)
      return { acceptanceCriteria: parsed.acceptanceCriteria || [] }
    } catch {
      const lines = response
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, 5)

      const acceptanceCriteria = lines.map((line, index) => ({
        given: '给定系统正常运行',
        when: `当${generateAcceptanceCriteriaDto.requirementContent}`,
        then: `那么应该${line.trim()}`,
        scenarioType: (index === 0 ? 'normal' : 'exception') as 'normal' | 'exception' | 'boundary',
      }))

      return { acceptanceCriteria }
    }
  }

  async qualityScore(qualityScoreDto: QualityScoreDto): Promise<QualityScore> {
    // 1. 获取并渲染提示词模板
    const prompt = await this.promptTemplateService.renderTemplate(
      'quality-assessment',
      {
        text: qualityScoreDto.text,
      },
      this.llmService,
    )

    // 2. 使用渲染后的提示词调用LLM
    const response = await this.llmService.generateCompletion(prompt)

    try {
      const parsed = JSON.parse(response)
      return {
        clarity: parsed.clarity || 5,
        testability: parsed.testability || 5,
        completeness: parsed.completeness || 5,
        totalScore: parsed.totalScore || 5,
        suggestions: parsed.suggestions || ['暂无改进建议'],
      }
    } catch {
      return {
        clarity: 5,
        testability: 5,
        completeness: 5,
        totalScore: 5,
        suggestions: ['质量评分失败，请检查需求格式'],
      }
    }
  }

  async validateRequirement(
    validateRequirementDto: AnalyzeRequirementDto,
  ): Promise<{ isValid: boolean; issues: string[]; suggestions: string[] }> {
    try {
      // 1. 获取并渲染提示词模板
      const prompt = await this.promptTemplateService.renderTemplate(
        'quality-assessment',
        {
          requirementText: validateRequirementDto.requirementText,
        },
        this.llmService,
      )

      // 2. 使用渲染后的提示词调用LLM
      const response = await this.llmService.generateCompletion(prompt)
      const parsed = JSON.parse(response)
      return {
        isValid: parsed.isValid || false,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || [],
      }
    } catch (error) {
      console.error('需求验证失败:', error)
      return {
        isValid: false,
        issues: ['需求验证失败，请检查需求格式'],
        suggestions: ['请确保需求描述清晰、完整、可测试'],
      }
    }
  }

  async suggestImprovements(
    suggestImprovementsDto: AnalyzeRequirementDto,
  ): Promise<{ improvements: string[]; rationale: string }> {
    try {
      // 1. 获取并渲染提示词模板
      const prompt = await this.promptTemplateService.renderTemplate(
        'quality-assessment',
        {
          requirementText: suggestImprovementsDto.requirementText,
        },
        this.llmService,
      )

      // 2. 使用渲染后的提示词调用LLM
      const response = await this.llmService.generateCompletion(prompt)
      const parsed = JSON.parse(response)
      return {
        improvements: parsed.improvements || [],
        rationale: parsed.rationale || '暂无改进建议',
      }
    } catch (error) {
      console.error('获取改进建议失败:', error)
      return {
        improvements: ['请提供更具体的需求描述'],
        rationale: '当前需求描述较为模糊，难以提供具体改进建议',
      }
    }
  }
}
