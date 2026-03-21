import { PrismaClient } from './generated/prisma-client';
import type { Prisma } from './generated/prisma-client';

export { PrismaClient };
export type { Prisma };

export * from './models/requirement';
export * from './models/project';
export * from './models/user';

export * from './dtos/requirement.dto';
export * from './dtos/project.dto';
export * from './dtos/user.dto';
export * from './dtos/auth.dto';
export * from './dtos/llm.dto';
export * from './dtos/prompt-template.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserPaginatedResult extends PaginatedResult<import('./dtos/user.dto').UserListItem> {}
export interface ProjectPaginatedResult extends PaginatedResult<import('./dtos/project.dto').ProjectListItem> {}
export interface RequirementPaginatedResult extends PaginatedResult<import('./dtos/requirement.dto').RequirementListItem> {}
export interface PromptTemplatePaginatedResult extends PaginatedResult<import('./dtos/prompt-template.dto').PromptTemplateListItem> {}
