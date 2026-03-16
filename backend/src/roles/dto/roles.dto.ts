import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string
}

export class RoleDto {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}
