import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto'
import { AddMemberDto, UpdateMemberDto } from './dto/members.dto'
import { UpdateSettingsDto } from './dto/settings.dto'
import { PaginationParams, PaginatedResult } from '../common/dto/pagination.dto'

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(userId: string, data: CreateProjectDto) {
    try {
      const project = await this.prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          key: data.key,
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

      return project
    } catch (error: any) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('key')) {
          throw new HttpException(
            { message: `项目关键字 "${data.key}" 已存在，请使用其他关键字` },
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

  async getProjects(userId: string, params: PaginationParams): Promise<PaginatedResult<any>> {
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
      data: projects,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getProjectById(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { include: { user: true } },
        projectSettings: true,
        requirements: true,
      },
    })

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    return project
  }

  async updateProject(projectId: string, data: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data,
    })
  }

  async deleteProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    return this.prisma.project.delete({ where: { id: projectId } })
  }

  async getProjectMembers(projectId: string) {
    const project = await this.getProjectById(projectId)
    return project.members
  }

  async addMember(projectId: string, data: AddMemberDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    const user = await this.prisma.user.findUnique({ where: { id: data.userId } })
    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`)
    }

    const existingMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.userId } },
    })

    if (existingMember) {
      throw new ForbiddenException(`User is already a member of this project`)
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: data.userId,
        role: data.role,
        permissions: data.permissions,
      },
    })
  }

  async updateMember(projectId: string, userId: string, data: UpdateMemberDto) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })

    if (!member) {
      throw new NotFoundException(`Member not found in this project`)
    }

    return this.prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data,
    })
  }

  async removeMember(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })

    if (!member) {
      throw new NotFoundException(`Member not found in this project`)
    }

    return this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    })
  }

  async getProjectSettings(projectId: string) {
    const project = await this.getProjectById(projectId)
    return project.projectSettings
  }

  async updateProjectSettings(projectId: string, data: UpdateSettingsDto) {
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
}
