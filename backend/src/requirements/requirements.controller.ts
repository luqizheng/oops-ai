import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common'
import { RequirementsService } from './requirements.service'
import {
  CreateRequirementDto,
  UpdateRequirementDto,
  AnalyzeFuzzyWordsDto,
  GenerateQuestionsDto,
  GenerateUserStoriesDto,
  GenerateAcceptanceCriteriaDto,
  QualityScoreDto,
} from './dto/requirements.dto'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('requirements')
@Controller('requirements')
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @ApiOperation({ summary: '创建新需求' })
  @ApiResponse({ status: 201, description: '需求创建成功' })
  create(@Body() createRequirementDto: CreateRequirementDto) {
    return this.requirementsService.create(createRequirementDto)
  }

  @Get()
  @ApiOperation({ summary: '获取所有需求' })
  findAll() {
    return this.requirementsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个需求' })
  findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新需求' })
  update(
    @Param('id') id: string,
    @Body() updateRequirementDto: UpdateRequirementDto,
  ) {
    return this.requirementsService.update(id, updateRequirementDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除需求' })
  remove(@Param('id') id: string) {
    return this.requirementsService.remove(id)
  }

  @Post('analyze/fuzzy-words')
  @ApiOperation({ summary: '分析模糊词' })
  analyzeFuzzyWords(@Body() analyzeFuzzyWordsDto: AnalyzeFuzzyWordsDto) {
    return this.requirementsService.analyzeFuzzyWords(analyzeFuzzyWordsDto)
  }

  @Post('questions')
  @ApiOperation({ summary: '生成追问列表' })
  generateQuestions(@Body() generateQuestionsDto: GenerateQuestionsDto) {
    return this.requirementsService.generateQuestions(generateQuestionsDto)
  }

  @Post('user-stories')
  @ApiOperation({ summary: '生成用户故事' })
  generateUserStories(@Body() generateUserStoriesDto: GenerateUserStoriesDto) {
    return this.requirementsService.generateUserStories(generateUserStoriesDto)
  }

  @Post('acceptance-criteria')
  @ApiOperation({ summary: '生成验收条件' })
  generateAcceptanceCriteria(
    @Body() generateAcceptanceCriteriaDto: GenerateAcceptanceCriteriaDto,
  ) {
    return this.requirementsService.generateAcceptanceCriteria(
      generateAcceptanceCriteriaDto,
    )
  }

  @Post('quality-score')
  @ApiOperation({ summary: '生成质量评分' })
  qualityScore(@Body() qualityScoreDto: QualityScoreDto) {
    return this.requirementsService.qualityScore(qualityScoreDto)
  }
}