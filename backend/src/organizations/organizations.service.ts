import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationDto } from './dto/organizations.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationDto> {
    const { name, description } = createOrganizationDto;

    // Check if organization already exists
    const existingOrganization = await this.prisma.organization.findUnique({ where: { name } });
    if (existingOrganization) {
      throw new ConflictException('Organization name already exists');
    }

    // Create organization
    const organization = await this.prisma.organization.create({
      data: { name, description },
    });

    return organization;
  }

  async findAll(): Promise<OrganizationDto[]> {
    return this.prisma.organization.findMany({
      include: {
        userOrganizations: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
  }

  async findOne(id: string): Promise<OrganizationDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        userOrganizations: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationDto> {
    // Check if organization exists
    const existingOrganization = await this.prisma.organization.findUnique({ where: { id } });
    if (!existingOrganization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if new name already exists
    if (updateOrganizationDto.name && updateOrganizationDto.name !== existingOrganization.name) {
      const organizationWithSameName = await this.prisma.organization.findUnique({ where: { name: updateOrganizationDto.name } });
      if (organizationWithSameName) {
        throw new ConflictException('Organization name already exists');
      }
    }

    // Update organization
    const organization = await this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });

    return organization;
  }

  async remove(id: string): Promise<void> {
    // Check if organization exists
    const existingOrganization = await this.prisma.organization.findUnique({ where: { id } });
    if (!existingOrganization) {
      throw new NotFoundException('Organization not found');
    }

    // Delete organization
    await this.prisma.organization.delete({ where: { id } });
  }
}
