// 项目创建 DTO
export interface CreateProjectDto {
  name: string;
  description?: string;
  key: string;
  settings?: any;
  status?: string;
}

// 项目更新 DTO
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  key?: string;
  settings?: any;
  status?: string;
}

// 项目成员添加 DTO
export interface AddProjectMemberDto {
  userId: string;
  role: string;
  permissions?: any;
}

// 项目成员更新 DTO
export interface UpdateProjectMemberDto {
  role?: string;
  permissions?: any;
}

// 项目设置更新 DTO
export interface UpdateProjectSettingsDto {
  workflowConfig?: any;
  notificationConfig?: any;
}
