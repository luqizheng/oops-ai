import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserSubmit, UpdateUserSubmit, UserResult, UserPaginatedResult, UserListItem } from '@oops-ai/shared'
import * as bcrypt from 'bcrypt'
import { PaginationParams } from '../common/dto/pagination.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(submit: CreateUserSubmit): Promise<UserResult> {
    const { email, password, name, roleId } = submit

    const existingUser = await this.prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new ConflictException('Email already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId,
      },
      include: {
        role: { select: { name: true } },
      },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserResult
  }

  async findAll(params: PaginationParams): Promise<UserPaginatedResult> {
    const { page, pageSize, search } = params
    const skip = (page - 1) * pageSize

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          role: { select: { name: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })) as UserListItem[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findOne(id: string): Promise<UserResult> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { name: true } },
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserResult
  }

  async update(id: string, submit: UpdateUserSubmit): Promise<UserResult> {
    const data: any = { ...submit }

    if (submit.password) {
      data.password = await bcrypt.hash(submit.password, 10)
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: { select: { name: true } },
      },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserResult
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      })
    } catch (error) {
      throw new NotFoundException('User not found')
    }
  }

  async getProjects(id: string) {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: { userId: id },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })
  }
}
