import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AddMemberDto {
  @IsUUID()
  userId: string;

  @IsString()
  role: string;

  @IsOptional()
  permissions?: any;
}

export class UpdateMemberDto {
  @IsString()
  role: string;

  @IsOptional()
  permissions?: any;
}