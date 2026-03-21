import { IsString, IsOptional } from 'class-validator'
import { ICreateProjectSubmit, IUpdateProjectSubmit } from '@oops-ai/shared'

export class CreateProjectDto implements ICreateProjectSubmit {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  key: string
}

export class UpdateProjectDto implements IUpdateProjectSubmit {
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
