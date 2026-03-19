import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectSubmit,
  UpdateProjectSubmit,
  AddProjectMemberSubmit,
  UpdateProjectMemberSubmit,
  CreateProjectResult,
  UpdateProjectResult,
  DeleteProjectResult,
  ProjectPaginatedResult,
  ProjectViewModel,
  ProjectMemberListItem,
  ProjectSettingsViewModel,
  UserListItem,
} from '@oops-ai/shared';
import { PaginationParams } from '../common/dto/pagination.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
  ): Promise<ProjectPaginatedResult> {
    const userId = req.user?.id;
    return this.projectsService.getProjects(userId, {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectViewModel> {
    return this.projectsService.getProjectById(id);
  }

  @Post()
  async create(
    @Body() submit: CreateProjectSubmit,
    @Request() req,
  ): Promise<CreateProjectResult> {
    const userId = req.user?.id;
    return this.projectsService.createProject(userId, submit);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() submit: UpdateProjectSubmit,
  ): Promise<UpdateProjectResult> {
    return this.projectsService.updateProject(id, submit);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<DeleteProjectResult> {
    await this.projectsService.deleteProject(id);
    return { success: true, message: '项目删除成功' };
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string): Promise<ProjectMemberListItem[]> {
    return this.projectsService.getProjectMembers(id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() submit: AddProjectMemberSubmit,
  ) {
    return this.projectsService.addMember(id, submit);
  }

  @Put(':id/members/:userId')
  async updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() submit: UpdateProjectMemberSubmit,
  ) {
    return this.projectsService.updateMember(id, userId, submit);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    await this.projectsService.removeMember(id, userId);
    return { success: true, message: '成员移除成功' };
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string): Promise<ProjectSettingsViewModel> {
    return this.projectsService.getProjectSettings(id);
  }

  @Put(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.projectsService.updateProjectSettings(id, data);
  }

  @Get('users')
  async getAllUsers(): Promise<UserListItem[]> {
    return this.projectsService.getAllUsers();
  }
}
