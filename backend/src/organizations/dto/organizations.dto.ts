import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string
}

export class OrganizationDto {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}
