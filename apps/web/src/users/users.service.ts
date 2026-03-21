import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PaginationParams } from '../common/dto/pagination.dto'
import {
  ICreateUserSubmit,
  IUpdateUserSubmit,
  CreateUserResult,
  UpdateUserResult,
  UserPaginatedResult,
  UserListItem,
  UserViewModel,
  RoleListItem,
} from '@oops-ai/shared'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: PaginationParams): Promise<UserPaginatedResult> {
    const { page, pageSize, search } = params
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { role: true },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        role: { name: user.role.name },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })) as UserListItem[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findById(id: string): Promise<UserViewModel> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: { name: user.role.name },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserViewModel
  }

  async create(userId: string | undefined, submit: ICreateUserSubmit): Promise<CreateUserResult> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: submit.email },
    })

    if (existingUser) {
      throw new ConflictException(`User with email ${submit.email} already exists`)
    }

    const hashedPassword = await bcrypt.hash(submit.password, 10)

    const user = await this.prisma.user.create({
      data: {
        email: submit.email,
        password: hashedPassword,
        name: submit.name,
        roleId: submit.roleId,
      },
      include: { role: true },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async update(id: string, submit: IUpdateUserSubmit): Promise<UpdateUserResult> {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    if (submit.email && submit.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: submit.email },
      })

      if (existingUser) {
        throw new ConflictException(`User with email ${submit.email} already exists`)
      }
    }

    const updateData: any = { ...submit }

    if (submit.password) {
      updateData.password = await bcrypt.hash(submit.password, 10)
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    })

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      roleId: updatedUser.roleId,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    await this.prisma.user.delete({ where: { id } })
  }

  async findAllRoles(): Promise<RoleListItem[]> {
    const roles = await this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || undefined,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    })) as RoleListItem[]
  }
}
