import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { ICreateUserSubmit, IUpdateUserSubmit } from '@oops-ai/shared'

export class CreateUserDto implements ICreateUserSubmit {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  roleId: string
}

export class UpdateUserDto implements IUpdateUserSubmit {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  roleId?: string
}

export class UserDto {
  id: string
  email: string
  name: string | null
  roleId: string
  role: { name: string }
  createdAt: Date
  updatedAt: Date
}
