import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleDto } from './dto/roles.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDto> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(): Promise<RoleDto[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RoleDto> {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<RoleDto> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(id);
  }
}
