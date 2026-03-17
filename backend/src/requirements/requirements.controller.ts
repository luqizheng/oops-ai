import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RequirementsService } from './requirements.service'
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
} from './dto/requirements.dto'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('requirements')
@Controller('requirements')
@UseGuards(AuthGuard())
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @ApiOperation({ summary: '创建新需求' })
  @ApiResponse({ status: 201, description: '需求创建成功' })
  create(@Req() req, @Body() createRequirementDto: CreateRequirementDto) {
    return this.requirementsService.create(req.user.id, createRequirementDto)
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
  update(@Param('id') id: string, @Body() updateRequirementDto: UpdateRequirementDto) {
    return this.requirementsService.update(id, updateRequirementDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除需求' })
  remove(@Param('id') id: string) {
    return this.requirementsService.remove(id)
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: '获取项目下的所有需求' })
  findByProject(@Param('projectId') projectId: string) {
    return this.requirementsService.findByProject(projectId)
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新需求状态' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.requirementsService.updateStatus(id, status)
  }

  @Put(':id/assign')
  @ApiOperation({ summary: '分配需求给负责人' })
  assign(@Param('id') id: string, @Body('assigneeId') assigneeId: string) {
    return this.requirementsService.assign(id, assigneeId)
  }

  @Get(':id/details')
  @ApiOperation({ summary: '获取需求详情（包含所有关联信息）' })
  getRequirementDetails(@Param('id') id: string) {
    return this.requirementsService.getRequirementDetails(id)
  }

  // ============================================
  // 1. 原始需求 (Raw Need) 相关API
  // ============================================

  @Post(':id/raw-requirements')
  @ApiOperation({ summary: '为需求添加原始需求' })
  createRawRequirement(
    @Param('id') id: string,
    @Body() createRawRequirementDto: CreateRawRequirementDto,
  ) {
    return this.requirementsService.createRawRequirement(id, createRawRequirementDto)
  }

  @Get(':id/raw-requirements')
  @ApiOperation({ summary: '获取需求的所有原始需求' })
  getRawRequirements(@Param('id') id: string) {
    return this.requirementsService.getRawRequirements(id)
  }

  @Get('raw-requirements/:rawId')
  @ApiOperation({ summary: '获取单个原始需求' })
  getRawRequirementById(@Param('rawId') rawId: string) {
    return this.requirementsService.getRawRequirementById(rawId)
  }

  @Put('raw-requirements/:rawId')
  @ApiOperation({ summary: '更新原始需求' })
  updateRawRequirement(
    @Param('rawId') rawId: string,
    @Body() updateRawRequirementDto: UpdateRawRequirementDto,
  ) {
    return this.requirementsService.updateRawRequirement(rawId, updateRawRequirementDto)
  }

  @Delete('raw-requirements/:rawId')
  @ApiOperation({ summary: '删除原始需求' })
  deleteRawRequirement(@Param('rawId') rawId: string) {
    return this.requirementsService.deleteRawRequirement(rawId)
  }

  // ============================================
  // 2. 用户故事 (User Story) 相关API
  // ============================================

  @Post(':id/user-stories')
  @ApiOperation({ summary: '为需求添加用户故事' })
  createUserStory(@Param('id') id: string, @Body() createUserStoryDto: CreateUserStoryDto) {
    return this.requirementsService.createUserStory(id, createUserStoryDto)
  }

  @Get(':id/user-stories')
  @ApiOperation({ summary: '获取需求的所有用户故事' })
  getUserStories(@Param('id') id: string) {
    return this.requirementsService.getUserStories(id)
  }

  @Get('user-stories/:storyId')
  @ApiOperation({ summary: '获取单个用户故事' })
  getUserStoryById(@Param('storyId') storyId: string) {
    return this.requirementsService.getUserStoryById(storyId)
  }

  @Put('user-stories/:storyId')
  @ApiOperation({ summary: '更新用户故事' })
  updateUserStory(
    @Param('storyId') storyId: string,
    @Body() updateUserStoryDto: UpdateUserStoryDto,
  ) {
    return this.requirementsService.updateUserStory(storyId, updateUserStoryDto)
  }

  @Delete('user-stories/:storyId')
  @ApiOperation({ summary: '删除用户故事' })
  deleteUserStory(@Param('storyId') storyId: string) {
    return this.requirementsService.deleteUserStory(storyId)
  }

  // ============================================
  // 3. 验收标准 (Acceptance Criteria) 相关API
  // ============================================

  @Post(':id/acceptance-criteria')
  @ApiOperation({ summary: '为需求添加验收标准' })
  createAcceptanceCriteria(
    @Param('id') id: string,
    @Body() createAcceptanceCriteriaDto: CreateAcceptanceCriteriaDto,
  ) {
    return this.requirementsService.createAcceptanceCriteria(id, createAcceptanceCriteriaDto)
  }

  @Get(':id/acceptance-criteria')
  @ApiOperation({ summary: '获取需求的所有验收标准' })
  getAcceptanceCriteria(@Param('id') id: string) {
    return this.requirementsService.getAcceptanceCriteria(id)
  }

  @Get('acceptance-criteria/:criteriaId')
  @ApiOperation({ summary: '获取单个验收标准' })
  getAcceptanceCriterionById(@Param('criteriaId') criteriaId: string) {
    return this.requirementsService.getAcceptanceCriterionById(criteriaId)
  }

  @Put('acceptance-criteria/:criteriaId')
  @ApiOperation({ summary: '更新验收标准' })
  updateAcceptanceCriteria(
    @Param('criteriaId') criteriaId: string,
    @Body() updateAcceptanceCriteriaDto: UpdateAcceptanceCriteriaDto,
  ) {
    return this.requirementsService.updateAcceptanceCriteria(
      criteriaId,
      updateAcceptanceCriteriaDto,
    )
  }

  @Delete('acceptance-criteria/:criteriaId')
  @ApiOperation({ summary: '删除验收标准' })
  deleteAcceptanceCriteria(@Param('criteriaId') criteriaId: string) {
    return this.requirementsService.deleteAcceptanceCriteria(criteriaId)
  }

  // ============================================
  // 4. 测试用例 (Test Cases) 相关API
  // ============================================

  @Post(':id/test-cases')
  @ApiOperation({ summary: '为需求添加测试用例' })
  createTestCase(@Param('id') id: string, @Body() createTestCaseDto: CreateTestCaseDto) {
    return this.requirementsService.createTestCase(id, createTestCaseDto)
  }

  @Get(':id/test-cases')
  @ApiOperation({ summary: '获取需求的所有测试用例' })
  getTestCases(@Param('id') id: string) {
    return this.requirementsService.getTestCases(id)
  }

  @Get('test-cases/:testCaseId')
  @ApiOperation({ summary: '获取单个测试用例' })
  getTestCaseById(@Param('testCaseId') testCaseId: string) {
    return this.requirementsService.getTestCaseById(testCaseId)
  }

  @Put('test-cases/:testCaseId')
  @ApiOperation({ summary: '更新测试用例' })
  updateTestCase(
    @Param('testCaseId') testCaseId: string,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ) {
    return this.requirementsService.updateTestCase(testCaseId, updateTestCaseDto)
  }

  @Delete('test-cases/:testCaseId')
  @ApiOperation({ summary: '删除测试用例' })
  deleteTestCase(@Param('testCaseId') testCaseId: string) {
    return this.requirementsService.deleteTestCase(testCaseId)
  }

  // ============================================
  // 5. 业务规则 (Business Rules) 相关API
  // ============================================

  @Post(':id/business-rules')
  @ApiOperation({ summary: '为需求添加业务规则' })
  createBusinessRule(
    @Param('id') id: string,
    @Body() createBusinessRuleDto: CreateBusinessRuleDto,
  ) {
    return this.requirementsService.createBusinessRule(id, createBusinessRuleDto)
  }

  @Get(':id/business-rules')
  @ApiOperation({ summary: '获取需求的所有业务规则' })
  getBusinessRules(@Param('id') id: string) {
    return this.requirementsService.getBusinessRules(id)
  }

  @Get('business-rules/:ruleId')
  @ApiOperation({ summary: '获取单个业务规则' })
  getBusinessRuleById(@Param('ruleId') ruleId: string) {
    return this.requirementsService.getBusinessRuleById(ruleId)
  }

  @Put('business-rules/:ruleId')
  @ApiOperation({ summary: '更新业务规则' })
  updateBusinessRule(
    @Param('ruleId') ruleId: string,
    @Body() updateBusinessRuleDto: UpdateBusinessRuleDto,
  ) {
    return this.requirementsService.updateBusinessRule(ruleId, updateBusinessRuleDto)
  }

  @Delete('business-rules/:ruleId')
  @ApiOperation({ summary: '删除业务规则' })
  deleteBusinessRule(@Param('ruleId') ruleId: string) {
    return this.requirementsService.deleteBusinessRule(ruleId)
  }

  // ============================================
  // 6. 非功能需求 (Non-functional Requirements) 相关API
  // ============================================

  @Post(':id/nfr-requirements')
  @ApiOperation({ summary: '为需求添加非功能需求' })
  createNFRRequirement(
    @Param('id') id: string,
    @Body() createNFRRequirementDto: CreateNFRRequirementDto,
  ) {
    return this.requirementsService.createNFRRequirement(id, createNFRRequirementDto)
  }

  @Get(':id/nfr-requirements')
  @ApiOperation({ summary: '获取需求的所有非功能需求' })
  getNFRRequirements(@Param('id') id: string) {
    return this.requirementsService.getNFRRequirements(id)
  }

  @Get('nfr-requirements/:nfrId')
  @ApiOperation({ summary: '获取单个非功能需求' })
  getNFRRequirementById(@Param('nfrId') nfrId: string) {
    return this.requirementsService.getNFRRequirementById(nfrId)
  }

  @Put('nfr-requirements/:nfrId')
  @ApiOperation({ summary: '更新非功能需求' })
  updateNFRRequirement(
    @Param('nfrId') nfrId: string,
    @Body() updateNFRRequirementDto: UpdateNFRRequirementDto,
  ) {
    return this.requirementsService.updateNFRRequirement(nfrId, updateNFRRequirementDto)
  }

  @Delete('nfr-requirements/:nfrId')
  @ApiOperation({ summary: '删除非功能需求' })
  deleteNFRRequirement(@Param('nfrId') nfrId: string) {
    return this.requirementsService.deleteNFRRequirement(nfrId)
  }

  // ============================================
  // 7. 依赖关系 (Dependencies) 相关API
  // ============================================

  @Post(':id/dependencies')
  @ApiOperation({ summary: '为需求添加依赖关系' })
  createDependency(
    @Param('id') id: string,
    @Body() createDependencyDto: CreateRequirementDependencyDto,
  ) {
    return this.requirementsService.createDependency(id, createDependencyDto)
  }

  @Get(':id/dependencies')
  @ApiOperation({ summary: '获取需求的所有依赖关系' })
  getDependencies(@Param('id') id: string) {
    return this.requirementsService.getDependencies(id)
  }

  @Get('dependencies/:dependencyId')
  @ApiOperation({ summary: '获取单个依赖关系' })
  getDependencyById(@Param('dependencyId') dependencyId: string) {
    return this.requirementsService.getDependencyById(dependencyId)
  }

  @Put('dependencies/:dependencyId')
  @ApiOperation({ summary: '更新依赖关系' })
  updateDependency(
    @Param('dependencyId') dependencyId: string,
    @Body() updateDependencyDto: UpdateRequirementDependencyDto,
  ) {
    return this.requirementsService.updateDependency(dependencyId, updateDependencyDto)
  }

  @Delete('dependencies/:dependencyId')
  @ApiOperation({ summary: '删除依赖关系' })
  deleteDependency(@Param('dependencyId') dependencyId: string) {
    return this.requirementsService.deleteDependency(dependencyId)
  }

  // ============================================
  // 8. 验收签名 (Acceptance Sign-off) 相关API
  // ============================================

  @Post(':id/acceptance-signoffs')
  @ApiOperation({ summary: '为需求添加验收签名' })
  createAcceptanceSignoff(
    @Param('id') id: string,
    @Req() req,
    @Body() createAcceptanceSignoffDto: CreateAcceptanceSignoffDto,
  ) {
    return this.requirementsService.createAcceptanceSignoff(
      id,
      req.user.id,
      createAcceptanceSignoffDto,
    )
  }

  @Get(':id/acceptance-signoffs')
  @ApiOperation({ summary: '获取需求的所有验收签名' })
  getAcceptanceSignoffs(@Param('id') id: string) {
    return this.requirementsService.getAcceptanceSignoffs(id)
  }

  @Get('acceptance-signoffs/:signoffId')
  @ApiOperation({ summary: '获取单个验收签名' })
  getAcceptanceSignoffById(@Param('signoffId') signoffId: string) {
    return this.requirementsService.getAcceptanceSignoffById(signoffId)
  }

  @Put('acceptance-signoffs/:signoffId')
  @ApiOperation({ summary: '更新验收签名' })
  updateAcceptanceSignoff(
    @Param('signoffId') signoffId: string,
    @Req() req,
    @Body() updateAcceptanceSignoffDto: UpdateAcceptanceSignoffDto,
  ) {
    return this.requirementsService.updateAcceptanceSignoff(
      signoffId,
      req.user.id,
      updateAcceptanceSignoffDto,
    )
  }

  @Delete('acceptance-signoffs/:signoffId')
  @ApiOperation({ summary: '删除验收签名' })
  deleteAcceptanceSignoff(@Param('signoffId') signoffId: string) {
    return this.requirementsService.deleteAcceptanceSignoff(signoffId)
  }
}
