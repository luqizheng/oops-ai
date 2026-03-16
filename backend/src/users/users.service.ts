import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/users.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { email, password, name, roleId, organizationIds } = createUserDto

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new ConflictException('Email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with organization associations
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId,
        userOrganizations: organizationIds
          ? {
              create: organizationIds.map((orgId) => ({ organizationId: orgId })),
            }
          : undefined,
      },
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } },
          },
        },
      },
    })

    return user as UserDto
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } },
          },
        },
      },
    })

    return users as UserDto[]
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user as UserDto
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      throw new NotFoundException('User not found')
    }

    // Hash password if provided
    const data: any = { ...updateUserDto }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    // Handle organization associations if provided
    if (data.organizationIds !== undefined) {
      // Get existing organization IDs for this user
      const existingOrgIds = (
        await this.prisma.userOrganization.findMany({
          where: { userId: id },
          select: { organizationId: true },
        })
      ).map((uo) => uo.organizationId)

      // Get new organization IDs
      const newOrgIds = data.organizationIds || []

      // Determine which organizations the user is exiting and entering
      const exitingOrgIds = existingOrgIds.filter((id) => !newOrgIds.includes(id))
      const enteringOrgIds = newOrgIds.filter((id) => !existingOrgIds.includes(id))

      // First delete all existing user-organization associations
      await this.prisma.userOrganization.deleteMany({ where: { userId: id } })

      // Then create new associations if organizationIds is not empty
      if (newOrgIds.length > 0) {
        data.userOrganizations = {
          create: newOrgIds.map((orgId) => ({ organizationId: orgId })),
        }
      }

      // Remove organizationIds from data since it's not a direct field on User model
      delete data.organizationIds

      // Handle project member updates for exiting organizations
      if (exitingOrgIds.length > 0) {
        // Get all project-organization associations for exiting organizations
        const exitingProjectOrgAssociations = await this.prisma.organizationProject.findMany({
          where: { organizationId: { in: exitingOrgIds } },
          select: { projectId: true },
        })

        // Get unique project IDs
        const exitingProjectIds = [...new Set(exitingProjectOrgAssociations.map(asso => asso.projectId))]

        // For each project, check if the user should be removed
        // We only remove the user if they're not associated with the project through any other organization
        for (const projectId of exitingProjectIds) {
          // Get all organizations associated with this project
          const projectOrgs = await this.prisma.organizationProject.findMany({
            where: { projectId },
            select: { organizationId: true },
          })

          const projectOrgIds = projectOrgs.map(asso => asso.organizationId)

          // Check if the user is still a member of any organization associated with this project
          const isStillMemberOfAnyProjectOrg = projectOrgIds.some(orgId => 
            newOrgIds.includes(orgId)
          )

          // If the user is not a member of any organization associated with this project,
          // and they are a member of the project, remove them
          if (!isStillMemberOfAnyProjectOrg) {
            const existingMember = await this.prisma.projectMember.findUnique({
              where: { projectId_userId: { projectId, userId: id } },
            })

            if (existingMember) {
              await this.prisma.projectMember.delete({
                where: { projectId_userId: { projectId, userId: id } },
              })
            }
          }
        }
      }

      // Handle project member updates for entering organizations
      if (enteringOrgIds.length > 0) {
        // Get all project-organization associations for entering organizations
        const enteringProjectOrgAssociations = await this.prisma.organizationProject.findMany({
          where: { organizationId: { in: enteringOrgIds } },
          select: { projectId: true },
        })

        // Get unique project IDs
        const enteringProjectIds = [...new Set(enteringProjectOrgAssociations.map(asso => asso.projectId))]

        // Add user to all these projects with default role 'reporter' if they're not already a member
        for (const projectId of enteringProjectIds) {
          const existingMember = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: id } },
          })

          if (!existingMember) {
            await this.prisma.projectMember.create({
              data: {
                projectId,
                userId: id,
                role: 'reporter',
                permissions: {},
              },
            })
          }
        }
      }
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } },
          },
        },
      },
    })

    return user as UserDto
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      throw new NotFoundException('User not found')
    }

    // Delete user
    await this.prisma.user.delete({ where: { id } })
  }
}
