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

// 项目单个响应 DTO
export interface ProjectResult extends ProjectListItem {
  members?: ProjectMemberListItem[];
  projectSettings?: ProjectSettingsResult;
}

// 项目分页响应 DTO
export interface ProjectPaginatedResult {
  data: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 项目成员添加 DTO - 客户端提交
export interface AddProjectMemberSubmit {
  userId: string;
  role: string;
  permissions?: any;
}

// 项目成员更新 DTO - 客户端提交
export interface UpdateProjectMemberSubmit {
  role?: string;
  permissions?: any;
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

// 项目成员单个响应 DTO
export interface ProjectMemberResult extends ProjectMemberListItem {}

// 项目设置更新 DTO - 客户端提交
export interface UpdateProjectSettingsSubmit {
  workflowConfig?: any;
  notificationConfig?: any;
}

// 项目设置响应 DTO
export interface ProjectSettingsResult {
  projectId: string;
  workflowConfig?: any;
  notificationConfig?: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}
