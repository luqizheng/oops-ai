import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { AIRequirementsService } from './ai-requirements.service'
import {
  AnalyzeFuzzyWordsDto,
  AnalyzeRequirementDto,
  GenerateQuestionsDto,
  GenerateUserStoriesDto,
  GenerateAcceptanceCriteriaDto,
  QualityScoreDto,
  FuzzyWordAnalysis,
  RequirementAnalysisResponse,
  QualityScore,
} from './dto/requirements.dto'

@ApiTags('AI需求分析')
@Controller('requirements/ai')
@ApiBearerAuth()
@UseGuards(AuthGuard())
export class AIRequirementsController {
  constructor(private readonly aiRequirementsService: AIRequirementsService) {}

  @Post('analyze/fuzzy-words')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分析需求中的模糊词汇' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '模糊词分析结果',
    type: FuzzyWordAnalysis,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效',
  })
  async analyzeFuzzyWords(@Body() analyzeFuzzyWordsDto: AnalyzeFuzzyWordsDto) {
    try {
      return await this.aiRequirementsService.analyzeFuzzyWords(analyzeFuzzyWordsDto)
    } catch (error) {
      throw new BadRequestException(`模糊词分析失败: ${error.message}`)
    }
  }

  @Post('analyze/requirement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI智能分析需求' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '需求分析结果',
    type: RequirementAnalysisResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'AI分析失败',
  })
  async analyzeRequirement(@Body() analyzeRequirementDto: AnalyzeRequirementDto) {
    try {
      return await this.aiRequirementsService.analyzeRequirement(analyzeRequirementDto)
    } catch (error) {
      throw new BadRequestException(`AI需求分析失败: ${error.message}`)
    }
  }

  @Post('questions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成需求追问列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '追问问题列表',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '生成追问失败',
  })
  async generateQuestions(@Body() generateQuestionsDto: GenerateQuestionsDto) {
    try {
      return await this.aiRequirementsService.generateQuestions(generateQuestionsDto)
    } catch (error) {
      throw new BadRequestException(`生成追问失败: ${error.message}`)
    }
  }

  @Post('user-stories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成用户故事' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户故事列表',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '生成用户故事失败',
  })
  async generateUserStories(@Body() generateUserStoriesDto: GenerateUserStoriesDto) {
    try {
      return await this.aiRequirementsService.generateUserStories(generateUserStoriesDto)
    } catch (error) {
      throw new BadRequestException(`生成用户故事失败: ${error.message}`)
    }
  }

  @Post('acceptance-criteria')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成验收条件' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验收条件列表',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '生成验收条件失败',
  })
  async generateAcceptanceCriteria(
    @Body() generateAcceptanceCriteriaDto: GenerateAcceptanceCriteriaDto,
  ) {
    try {
      return await this.aiRequirementsService.generateAcceptanceCriteria(
        generateAcceptanceCriteriaDto,
      )
    } catch (error) {
      throw new BadRequestException(`生成验收条件失败: ${error.message}`)
    }
  }

  @Post('quality-score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成需求质量评分' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '质量评分结果',
    type: QualityScore,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '质量评分失败',
  })
  async qualityScore(@Body() qualityScoreDto: QualityScoreDto) {
    try {
      return await this.aiRequirementsService.qualityScore(qualityScoreDto)
    } catch (error) {
      throw new BadRequestException(`质量评分失败: ${error.message}`)
    }
  }

  @Post('validate/requirement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证需求完整性' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证结果',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证失败',
  })
  async validateRequirement(@Body() validateRequirementDto: AnalyzeRequirementDto) {
    try {
      return await this.aiRequirementsService.validateRequirement(validateRequirementDto)
    } catch (error) {
      throw new BadRequestException(`需求验证失败: ${error.message}`)
    }
  }

  @Post('suggest/improvements')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取需求改进建议' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '改进建议列表',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '获取改进建议失败',
  })
  async suggestImprovements(@Body() suggestImprovementsDto: AnalyzeRequirementDto) {
    try {
      return await this.aiRequirementsService.suggestImprovements(suggestImprovementsDto)
    } catch (error) {
      throw new BadRequestException(`获取改进建议失败: ${error.message}`)
    }
  }
}
