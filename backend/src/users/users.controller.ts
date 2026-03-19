import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { UsersService } from './users.service'
import {
  CreateUserSubmit,
  UpdateUserSubmit,
  CreateUserResult,
  UpdateUserResult,
  DeleteUserResult,
  UserPaginatedResult,
  Role,
} from '@oops-ai/shared'
import { PaginationParams } from '../common/dto/pagination.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
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
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Post()
  async create(@Body() submit: CreateUserSubmit, @Request() req): Promise<CreateUserResult> {
    const userId = req.user?.id
    return this.usersService.create(userId, submit)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() submit: UpdateUserSubmit,
  ): Promise<UpdateUserResult> {
    return this.usersService.update(id, submit)
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<DeleteUserResult> {
    await this.usersService.remove(id)
    return { success: true, message: '用户删除成功' }
  }

  @Get('roles/list')
  findRoles() {
    return this.usersService.findAllRoles()
  }
}
