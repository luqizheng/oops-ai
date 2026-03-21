// 用户创建 DTO - 客户端提交
export interface ICreateUserSubmit {
  email: string;
  password: string;
  name?: string;
  roleId: string;
}

// 用户更新 DTO - 客户端提交
export interface IUpdateUserSubmit {
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
}

// 用户登录 DTO - 客户端提交
export interface ILoginSubmit {
  email: string;
  password: string;
}

// 角色创建 DTO - 客户端提交
export interface ICreateRoleSubmit {
  name: string;
  description?: string;
}

// 角色更新 DTO - 客户端提交
export interface IUpdateRoleSubmit {
  name?: string;
  description?: string;
}

// 项目创建 DTO - 客户端提交
export interface ICreateProjectSubmit {
  name: string;
  description?: string;
  key: string;
}

// 项目更新 DTO - 客户端提交
export interface IUpdateProjectSubmit {
  name?: string;
  description?: string;
  status?: string;
}

// 添加项目成员 DTO - 客户端提交
export interface IAddProjectMemberSubmit {
  userId: string;
  role: string;
  permissions?: any;
}

// 更新项目成员 DTO - 客户端提交
export interface IUpdateProjectMemberSubmit {
  role?: string;
  permissions?: any;
}

// 更新项目设置 DTO - 客户端提交
export interface IUpdateProjectSettingsSubmit {
  workflowConfig?: any;
  notificationConfig?: any;
}
