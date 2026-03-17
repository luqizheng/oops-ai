import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/users.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOne(id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto)
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
