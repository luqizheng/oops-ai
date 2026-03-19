// 导出模型和DTO
export * from './models/requirement';
export * from './models/project';
export * from './models/user';

export * from './dtos/requirement.dto';
export * from './dtos/project.dto';
export * from './dtos/user.dto';
export * from './dtos/auth.dto';

// 导出分页结果接口
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 用户分页结果
export interface UserPaginatedResult extends PaginatedResult<import('./dtos/user.dto').UserListItem> {}

// 项目分页结果
export interface ProjectPaginatedResult extends PaginatedResult<import('./dtos/project.dto').ProjectListItem> {}
