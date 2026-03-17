import { IsOptional, IsObject } from 'class-validator'

export class UpdateSettingsDto {
  @IsOptional()
  @IsObject()
  workflowConfig?: any

  @IsOptional()
  @IsObject()
  notificationConfig?: any
}
