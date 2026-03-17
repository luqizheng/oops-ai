import { Injectable, BadRequestException } from '@nestjs/common'
import { LLMService } from '../llm/llm.service'
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
  constructor(private readonly llmService: LLMService) {}

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

      try {
        const parsed = JSON.parse(response)
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
    const prompt = `你是一个资深测试工程师，请根据以下需求内容，生成3-5个Given-When-Then格式的验收条件：

需求内容：${generateAcceptanceCriteriaDto.requirementContent}

请输出JSON格式，包含acceptanceCriteria数组，每个验收条件包含given、when、then和scenarioType字段。`

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
    const prompt = `你是一个资深需求分析师，请评估以下需求的质量，给出清晰度、可测试性、完整性的评分（0-10分）：

需求文本：${qualityScoreDto.text}

请输出JSON格式：
{
  "clarity": 8,
  "testability": 7,
  "completeness": 6,
  "totalScore": 7
}

评分标准：
1. 清晰度：需求描述是否明确无歧义
2. 可测试性：需求是否可以被验证和测试
3. 完整性：需求是否包含所有必要信息`

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
    const prompt = `你是一个资深需求分析师，请验证以下需求是否完整、可测试、无歧义：

需求：${validateRequirementDto.requirementText}

请输出JSON格式：
{
  "isValid": true,
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}

验证标准：
1. 需求是否包含明确的角色、功能、价值
2. 需求是否可测试和验证
3. 需求是否有模糊词汇
4. 需求是否包含必要的约束条件`

    try {
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
    const prompt = `你是一个资深产品经理，请为以下需求提供改进建议：

需求：${suggestImprovementsDto.requirementText}

请输出JSON格式：
{
  "improvements": ["改进建议1", "改进建议2", "改进建议3"],
  "rationale": "改进的理由和预期效果"
}

改进方向：
1. 使需求更具体和可量化
2. 提高需求的可测试性
3. 消除模糊词汇
4. 补充缺失的信息`

    try {
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
