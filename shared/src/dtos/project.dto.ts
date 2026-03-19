// 项目列表项 DTO
export interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  key: string;
  status?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  ownerId?: string;
}

// 项目视图模型 DTO
export interface ProjectViewModel {
  id: string;
  name: string;
  description?: string;
  key: string;
  status?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  ownerId?: string;
  members?: ProjectMemberListItem[];
  projectSettings?: ProjectSettingsViewModel;
}

// 创建项目结果 DTO
export interface CreateProjectResult {
  id: string;
  name: string;
  description?: string;
  key: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 更新项目结果 DTO
export interface UpdateProjectResult {
  id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 删除项目结果 DTO
export interface DeleteProjectResult {
  success: boolean;
  message?: string;
}

// 项目成员列表项 DTO
export interface ProjectMemberListItem {
  projectId: string;
  userId: string;
  role: string;
  permissions?: any;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  joinedAt: Date | string;
}

// 项目成员视图模型 DTO
export interface ProjectMemberViewModel extends ProjectMemberListItem {}

// 添加项目成员结果 DTO
export interface AddProjectMemberResult extends ProjectMemberListItem {}

// 更新项目成员结果 DTO
export interface UpdateProjectMemberResult {
  projectId: string;
  userId: string;
  role: string;
  permissions?: any;
  joinedAt: Date | string;
}

// 项目设置视图模型 DTO
export interface ProjectSettingsViewModel {
  projectId: string;
  workflowConfig?: any;
  notificationConfig?: any;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// 更新项目设置结果 DTO
export interface UpdateProjectSettingsResult extends ProjectSettingsViewModel {}
