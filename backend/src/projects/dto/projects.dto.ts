import { IsString, IsOptional } from 'class-validator'

export class CreateProjectDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  key: string
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
