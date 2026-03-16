import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, RoleDto } from './dto/roles.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDto> {
    const { name, description } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({ where: { name } });
    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    // Create role
    const role = await this.prisma.role.create({
      data: { name, description },
    });

    return role;
  }

  async findAll(): Promise<RoleDto[]> {
    return this.prisma.role.findMany();
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleDto> {
    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Check if new name already exists
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const roleWithSameName = await this.prisma.role.findUnique({ where: { name: updateRoleDto.name } });
      if (roleWithSameName) {
        throw new ConflictException('Role name already exists');
      }
    }

    // Update role
    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return role;
  }

  async remove(id: string): Promise<void> {
    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Delete role
    await this.prisma.role.delete({ where: { id } });
  }
}
