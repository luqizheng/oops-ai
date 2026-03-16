import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
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

  @IsOptional()
  organizationIds?: string[]
}

export class UpdateUserDto {
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

  @IsOptional()
  organizationIds?: string[]
}

export class UserDto {
  id: string
  email: string
  name: string | null
  roleId: string
  role: { name: string }
  userOrganizations: { organization: { id: string; name: string } }[]
  createdAt: Date
  updatedAt: Date
}
