import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationDto } from './dto/organizations.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('organizations')
@UseGuards(AuthGuard('jwt'))
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<OrganizationDto> {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  findAll(): Promise<OrganizationDto[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrganizationDto> {
    return this.organizationsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationDto> {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.organizationsService.remove(id);
  }
}
