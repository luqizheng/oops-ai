import { IsString, IsOptional, IsUUID } from 'class-validator'
import { IAddProjectMemberSubmit, IUpdateProjectMemberSubmit } from '@oops-ai/shared'

export class AddMemberDto implements IAddProjectMemberSubmit {
  @IsUUID()
  userId: string

  @IsString()
  role: string

  @IsOptional()
  permissions?: any
}

export class UpdateMemberDto implements IUpdateProjectMemberSubmit {
  @IsString()
  role: string

  @IsOptional()
  permissions?: any
}
