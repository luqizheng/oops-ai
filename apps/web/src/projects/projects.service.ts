import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  ICreateProjectSubmit,
  IUpdateProjectSubmit,
  IAddProjectMemberSubmit,
  IUpdateProjectMemberSubmit,
  CreateProjectResult,
  UpdateProjectResult,
  ProjectPaginatedResult,
  ProjectListItem,
  ProjectViewModel,
  ProjectMemberListItem,
  ProjectSettingsViewModel,
  UserListItem,
} from '@oops-ai/shared'
import { PaginationParams } from '../common/dto/pagination.dto'

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(userId: string, submit: ICreateProjectSubmit): Promise<CreateProjectResult> {
    try {
      const project = await this.prisma.project.create({
        data: {
          name: submit.name,
          description: submit.description,
          key: submit.key,
          createdBy: userId,
          members: {
            create: {
              userId,
              role: 'project_manager',
            },
          },
          projectSettings: {
            create: {},
          },
        },
      })

      return {
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        key: project.key,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('key')) {
          throw new HttpException(
            { message: `项目关键字 "${submit.key}" 已存在，请使用其他关键字` },
            HttpStatus.CONFLICT,
          )
        }
        throw new HttpException({ message: '项目创建失败，数据已存在' }, HttpStatus.CONFLICT)
      }
      if (error.code?.startsWith('P')) {
        throw new HttpException(
          { message: `数据库错误：${error.message}` },
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      throw new HttpException(
        { message: `创建项目失败：${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async getProjects(userId: string, params: PaginationParams): Promise<ProjectPaginatedResult> {
    const { page, pageSize, search } = params
    const skip = (page - 1) * pageSize

    const where: any = {
      createdBy: userId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { key: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          projectSettings: true,
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ])

    return {
      data: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        key: project.key,
        status: project.status || undefined,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        ownerId: project.createdBy,
      })) as ProjectListItem[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getProjectById(projectId: string): Promise<ProjectViewModel> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        projectSettings: true,
        requirements: true,
      },
    })

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      key: project.key,
      status: project.status || undefined,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      ownerId: project.createdBy,
      members: project.members.map((member) => ({
        projectId: member.projectId,
        userId: member.userId,
        role: member.role,
        permissions: member.permissions,
        user: member.user,
        joinedAt: member.joinedAt,
      })),
      projectSettings: project.projectSettings
        ? {
            projectId: project.projectSettings.projectId,
            workflowConfig: project.projectSettings.workflowConfig,
            notificationConfig: project.projectSettings.notificationConfig,
            createdAt: project.projectSettings.createdAt,
            updatedAt: project.projectSettings.updatedAt,
          }
        : undefined,
    }
  }

  async updateProject(
    projectId: string,
    submit: IUpdateProjectSubmit,
  ): Promise<UpdateProjectResult> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: submit,
    })

    return {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description || undefined,
      status: updatedProject.status || undefined,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    }
  }

  async deleteProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    await this.prisma.project.delete({ where: { id: projectId } })
  }

  async getProjectMembers(projectId: string): Promise<ProjectMemberListItem[]> {
    const project = await this.getProjectById(projectId)
    return project.members || []
  }

  async addMember(
    projectId: string,
    submit: IAddProjectMemberSubmit,
  ): Promise<ProjectMemberListItem> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    const user = await this.prisma.user.findUnique({ where: { id: submit.userId } })
    if (!user) {
      throw new NotFoundException(`User with ID ${submit.userId} not found`)
    }

    const existingMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: submit.userId } },
    })

    if (existingMember) {
      throw new ForbiddenException(`User is already a member of this project`)
    }

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: submit.userId,
        role: submit.role,
        permissions: submit.permissions,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return {
      projectId: member.projectId,
      userId: member.userId,
      role: member.role,
      permissions: member.permissions,
      user: member.user,
      joinedAt: member.joinedAt,
    }
  }

  async updateMember(projectId: string, userId: string, submit: IUpdateProjectMemberSubmit) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })

    if (!member) {
      throw new NotFoundException(`Member not found in this project`)
    }

    return this.prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: submit,
    })
  }

  async removeMember(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })

    if (!member) {
      throw new NotFoundException(`Member not found in this project`)
    }

    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    })
  }

  async getProjectSettings(projectId: string): Promise<ProjectSettingsViewModel> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { projectSettings: true },
    })

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    if (!project.projectSettings) {
      throw new NotFoundException(`Settings not found for project ${projectId}`)
    }

    return {
      projectId: project.projectSettings.projectId,
      workflowConfig: project.projectSettings.workflowConfig,
      notificationConfig: project.projectSettings.notificationConfig,
      createdAt: project.projectSettings.createdAt,
      updatedAt: project.projectSettings.updatedAt,
    }
  }

  async updateProjectSettings(projectId: string, data: any) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    return this.prisma.projectSettings.update({
      where: { projectId },
      data,
    })
  }

  async updateWorkflow(projectId: string, workflowConfig: any) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    return this.prisma.projectSettings.update({
      where: { projectId },
      data: { workflowConfig },
    })
  }

  async getAllUsers(): Promise<UserListItem[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { role: true },
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: { name: user.role.name },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })) as UserListItem[]
  }
}
