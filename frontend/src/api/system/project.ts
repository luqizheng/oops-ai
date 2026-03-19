import { http } from "@/utils/http";

export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  key: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type ListResult = {
  success: boolean;
  data: PaginatedResult<Project>;
};

type SingleResult = {
  success: boolean;
  data: Project;
};

export const getProjects = (params: PaginationParams) => {
  return http.request<ListResult>("get", "/projects", { params });
};

export const getProject = (id: string) => {
  return http.request<SingleResult>("get", `/projects/${id}`);
};

export const createProject = (data: CreateProjectDto) => {
  return http.request<SingleResult>("post", "/projects", { data });
};

export const updateProject = (id: string, data: UpdateProjectDto) => {
  return http.request<SingleResult>("put", `/projects/${id}`, { data });
};

export const deleteProject = (id: string) => {
  return http.request("delete", `/projects/${id}`);
};

export const getProjectMembers = (projectId: string) => {
  return http.request("get", `/projects/${projectId}/members`);
};

export const addProjectMember = (
  projectId: string,
  data: { userId: string; role: string }
) => {
  return http.request("post", `/projects/${projectId}/members`, { data });
};

export const removeProjectMember = (projectId: string, userId: string) => {
  return http.request("delete", `/projects/${projectId}/members/${userId}`);
};
