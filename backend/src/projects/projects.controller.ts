import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto'
import { AddMemberDto, UpdateMemberDto } from './dto/members.dto'
import { UpdateSettingsDto } from './dto/settings.dto'
import { PaginatedResult } from '../common/dto/pagination.dto'

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Req() req, @Body() data: CreateProjectDto) {
    return this.projectsService.createProject(req.user.id, data)
  }

  @Get()
  getProjects(
    @Req() req,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
  ): Promise<PaginatedResult<any>> {
    return this.projectsService.getProjects(req.user.id, {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
      search,
    })
  }

  @Get(':id')
  getProjectById(@Param('id') id: string) {
    return this.projectsService.getProjectById(id)
  }

  @Put(':id')
  updateProject(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.updateProject(id, data)
  }

  @Delete(':id')
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id)
  }

  @Get(':id/members')
  getProjectMembers(@Param('id') id: string) {
    return this.projectsService.getProjectMembers(id)
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() data: AddMemberDto) {
    return this.projectsService.addMember(id, data)
  }

  @Put(':id/members/:userId')
  updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() data: UpdateMemberDto,
  ) {
    return this.projectsService.updateMember(id, userId, data)
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(id, userId)
  }

  @Get(':id/settings')
  getProjectSettings(@Param('id') id: string) {
    return this.projectsService.getProjectSettings(id)
  }

  @Put(':id/settings')
  updateProjectSettings(@Param('id') id: string, @Body() data: UpdateSettingsDto) {
    return this.projectsService.updateProjectSettings(id, data)
  }

  @Get(':id/workflow')
  getWorkflow(@Param('id') id: string) {
    return this.projectsService.getProjectSettings(id).then((settings) => settings?.workflowConfig)
  }

  @Put(':id/workflow')
  updateWorkflow(@Param('id') id: string, @Body() workflowConfig: any) {
    return this.projectsService.updateWorkflow(id, workflowConfig)
  }
}
