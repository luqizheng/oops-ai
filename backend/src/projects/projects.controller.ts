import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ProjectsService } from './projects.service'
import {
  CreateProjectSubmit,
  UpdateProjectSubmit,
  ProjectResult,
  ProjectPaginatedResult,
  AddProjectMemberSubmit,
  UpdateProjectMemberSubmit,
  ProjectSettingsResult,
} from '@oops-ai/shared'

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Req() req, @Body() submit: CreateProjectSubmit) {
    return this.projectsService.createProject(req.user.id, submit)
  }

  @Get()
  getProjects(
    @Req() req,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
  ): Promise<ProjectPaginatedResult> {
    return this.projectsService.getProjects(req.user.id, {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
      search,
    })
  }

  @Get(':id')
  getProjectById(@Param('id') id: string): Promise<ProjectResult> {
    return this.projectsService.getProjectById(id)
  }

  @Put(':id')
  updateProject(@Param('id') id: string, @Body() submit: UpdateProjectSubmit) {
    return this.projectsService.updateProject(id, submit)
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
  addMember(@Param('id') id: string, @Body() submit: AddProjectMemberSubmit) {
    return this.projectsService.addMember(id, submit)
  }

  @Put(':id/members/:userId')
  updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() submit: UpdateProjectMemberSubmit,
  ) {
    return this.projectsService.updateMember(id, userId, submit)
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(id, userId)
  }

  @Get(':id/settings')
  getProjectSettings(@Param('id') id: string): Promise<ProjectSettingsResult> {
    return this.projectsService.getProjectSettings(id)
  }

  @Put(':id/settings')
  updateProjectSettings(@Param('id') id: string, @Body() data: any) {
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
