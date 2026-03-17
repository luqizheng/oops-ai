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

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // 项目CRUD操作
  async createProject(userId: string, data: CreateProjectDto) {
    try {
      // Create project with basic data and project manager
      const project = await this.prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          key: data.key,
          createdBy: userId,
          members: {
            create: {
              userId,
              role: 'project_manager', // 创建者默认是项目经理
            },
          },
          projectSettings: {
            create: {},
          },
        },
      })

      return project
    } catch (error: any) {
      // 处理数据库唯一约束错误
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('key')) {
          throw new HttpException(
            { message: `项目关键字 "${data.key}" 已存在，请使用其他关键字` },
            HttpStatus.CONFLICT,
          )
        }
        throw new HttpException({ message: '项目创建失败，数据已存在' }, HttpStatus.CONFLICT)
      }
      // 处理其他数据库错误
      if (error.code?.startsWith('P')) {
        throw new HttpException(
          { message: `数据库错误：${error.message}` },
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      // 处理其他未知错误
      throw new HttpException(
        { message: `创建项目失败：${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async getProjects(userId: string) {
    return this.prisma.project.findMany({
      where: {
        createdBy: userId, // 只返回当前用户创建的项目
      },
      include: {
        projectSettings: true,
        members: true, // 包含成员信息以显示成员数
      },
    })
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

  // 项目成员管理
  async getProjectMembers(projectId: string) {
    const project = await this.getProjectById(projectId)
    return project.members
  }

  async addMember(projectId: string, data: AddMemberDto) {
    // 检查项目是否存在
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`)
    }

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } })
    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`)
    }

    // 检查用户是否已经是项目成员
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

  // 项目设置管理
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

  // 工作流管理
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

  // 权限检查
  async canUserAccessProject(userId: string, projectId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })
    return !!member
  }

  async getProjectMember(projectId: string, userId: string) {
    return this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })
  }

  async canUserManageProject(userId: string, projectId: string) {
    const member = await this.getProjectMember(projectId, userId)
    if (!member) {
      return false
    }

    // 只有项目经理和产品经理可以管理项目
    return member.role === 'project_manager' || member.role === 'product_manager'
  }

  async canUserCreateRequirement(userId: string, projectId: string) {
    return this.canUserAccessProject(userId, projectId)
  }

  async canUserUpdateRequirement(userId: string, requirementId: string) {
    const requirement = await this.prisma.requirement.findUnique({ where: { id: requirementId } })
    if (!requirement) {
      return false
    }

    return this.canUserAccessProject(userId, requirement.projectId)
  }
}
