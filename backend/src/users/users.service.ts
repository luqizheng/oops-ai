import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { email, password, name, roleId, organizationId } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId,
        organizationId,
      },
      include: {
        role: { select: { name: true } },
        organization: { select: { name: true } },
      },
    });

    return user as UserDto;
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        role: { select: { name: true } },
        organization: { select: { name: true } },
      },
    });

    return users as UserDto[];
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { name: true } },
        organization: { select: { name: true } },
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

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: { select: { name: true } },
        organization: { select: { name: true } },
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
