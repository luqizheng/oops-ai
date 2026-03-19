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

// 用户视图模型 DTO
export interface UserViewModel {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: { name: string };
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 创建用户结果 DTO
export interface CreateUserResult {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 更新用户结果 DTO
export interface UpdateUserResult {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 删除用户结果 DTO
export interface DeleteUserResult {
  success: boolean;
  message?: string;
}

// 用户登录结果 DTO
export interface LoginResult {
  id: string;
  email: string;
  name?: string;
  roleId: string;
}

// 角色列表项 DTO
export interface RoleListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 角色视图模型 DTO
export interface RoleViewModel extends RoleListItem {}

// 角色创建结果 DTO
export interface CreateRoleResult extends RoleListItem {}

// 角色更新结果 DTO
export interface UpdateRoleResult extends RoleListItem {}

// 权限列表项 DTO
export interface PermissionListItem {
  id: string;
  name: string;
  description?: string;
  roleId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 权限视图模型 DTO
export interface PermissionViewModel extends PermissionListItem {}
