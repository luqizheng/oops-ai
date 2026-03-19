import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { AuthGuard } from '@nestjs/passport'
import {
  CreateUserSubmit,
  UpdateUserSubmit,
  UserResult,
  UserPaginatedResult,
} from '@oops-ai/shared'

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() submit: CreateUserSubmit): Promise<UserResult> {
    return this.usersService.create(submit)
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
  ): Promise<UserPaginatedResult> {
    return this.usersService.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
      search,
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResult> {
    return this.usersService.findOne(id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() submit: UpdateUserSubmit): Promise<UserResult> {
    return this.usersService.update(id, submit)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id)
  }

  @Get(':id/projects')
  getProjects(@Param('id') id: string) {
    return this.usersService.getProjects(id)
  }
}
