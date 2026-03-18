// 用户创建 DTO
export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  roleId: string;
}

// 用户更新 DTO
export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
}

// 用户登录 DTO
export interface LoginDto {
  email: string;
  password: string;
}

// 用户响应 DTO
export interface UserResponseDto {
  id: string;
  email: string;
  name?: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 角色创建 DTO
export interface CreateRoleDto {
  name: string;
  description?: string;
}

// 角色更新 DTO
export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

// 权限创建 DTO
export interface CreatePermissionDto {
  name: string;
  description?: string;
  roleId: string;
}

// 权限更新 DTO
export interface UpdatePermissionDto {
  name?: string;
  description?: string;
}
