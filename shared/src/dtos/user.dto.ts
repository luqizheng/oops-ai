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

// 用户登录响应 DTO
export interface LoginResult {
  id: string;
  email: string;
  name?: string;
  roleId: string;
}

// 用户列表项 DTO
export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: { name: string };
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 用户单个响应 DTO
export interface UserResult extends UserListItem {}

// 用户分页响应 DTO
export interface UserPaginatedResult {
  data: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

// 角色列表项 DTO
export interface RoleListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 角色单个响应 DTO
export interface RoleResult extends RoleListItem {}

// 权限创建 DTO - 客户端提交
export interface CreatePermissionSubmit {
  name: string;
  description?: string;
  roleId: string;
}

// 权限列表项 DTO
export interface PermissionListItem {
  id: string;
  name: string;
  description?: string;
  roleId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 权限单个响应 DTO
export interface PermissionResult extends PermissionListItem {}
