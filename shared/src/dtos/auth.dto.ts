// 用户创建 DTO - 客户端提交
export interface CreateUserSubmit {
  email: string;
  password: string;
  name?: string;
  roleId: string;
}

// 用户更新 DTO - 客户端提交
export interface UpdateUserSubmit {
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
}

// 用户登录 DTO - 客户端提交
export interface LoginSubmit {
  email: string;
  password: string;
}

// 角色创建 DTO - 客户端提交
export interface CreateRoleSubmit {
  name: string;
  description?: string;
}

// 角色更新 DTO - 客户端提交
export interface UpdateRoleSubmit {
  name?: string;
  description?: string;
}

// 项目创建 DTO - 客户端提交
export interface CreateProjectSubmit {
  name: string;
  description?: string;
  key: string;
}

// 项目更新 DTO - 客户端提交
export interface UpdateProjectSubmit {
  name?: string;
  description?: string;
  status?: string;
}

// 添加项目成员 DTO - 客户端提交
export interface AddProjectMemberSubmit {
  userId: string;
  role: string;
  permissions?: any;
}

// 更新项目成员 DTO - 客户端提交
export interface UpdateProjectMemberSubmit {
  role?: string;
  permissions?: any;
}

// 更新项目设置 DTO - 客户端提交
export interface UpdateProjectSettingsSubmit {
  workflowConfig?: any;
  notificationConfig?: any;
}
