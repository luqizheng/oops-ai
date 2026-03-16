import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator'

export class CreateProjectDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  key: string

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  organizationIds?: string[]
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  settings?: any
}
