import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { email, password, name, roleId, organizationIds } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with organization associations
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId,
        userOrganizations: organizationIds ? {
          create: organizationIds.map(orgId => ({ organizationId: orgId }))
        } : undefined,
      },
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } }
          }
        },
      },
    });

    return user as UserDto;
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } }
          }
        },
      },
    });

    return users as UserDto[];
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } }
          }
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as UserDto;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Hash password if provided
    const data: any = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Handle organization associations if provided
    if (data.organizationIds !== undefined) {
      // First delete all existing user-organization associations
      await this.prisma.userOrganization.deleteMany({ where: { userId: id } });
      
      // Then create new associations if organizationIds is not empty
      if (data.organizationIds.length > 0) {
        data.userOrganizations = {
          create: data.organizationIds.map(orgId => ({ organizationId: orgId }))
        };
      }
      
      // Remove organizationIds from data since it's not a direct field on User model
      delete data.organizationIds;
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: { select: { name: true } },
        userOrganizations: {
          include: {
            organization: { select: { id: true, name: true } }
          }
        },
      },
    });

    return user as UserDto;
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Delete user
    await this.prisma.user.delete({ where: { id } });
  }
}
