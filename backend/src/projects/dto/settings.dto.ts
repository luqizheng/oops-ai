import { IsOptional, IsObject } from 'class-validator'
import { IUpdateProjectSettingsSubmit } from '@oops-ai/shared'

export class UpdateSettingsDto implements IUpdateProjectSettingsSubmit {
  @IsOptional()
  @IsObject()
  workflowConfig?: any

  @IsOptional()
  @IsObject()
  notificationConfig?: any
}
