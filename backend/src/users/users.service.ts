import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/users.dto'
import { PaginationParams, PaginatedResult } from '../common/dto/pagination.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { email, password, name, roleId } = createUserDto

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
    } as UserDto
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<UserDto>> {
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
      })) as UserDto[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findOne(id: string): Promise<UserDto> {
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
    } as UserDto
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const data: any = { ...updateUserDto }

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10)
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
    } as UserDto
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
