import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ICreateRoleSubmit, IUpdateRoleSubmit } from '@oops-ai/shared'

export class CreateRoleDto implements ICreateRoleSubmit {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateRoleDto implements IUpdateRoleSubmit {
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
