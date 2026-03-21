import { http } from "@/utils/http";
import type {
  CreateProjectSubmit,
  UpdateProjectSubmit,
  AddProjectMemberSubmit,
  CreateProjectResult,
  UpdateProjectResult,
  DeleteProjectResult,
  ProjectPaginatedResult,
  ProjectViewModel,
  ProjectMemberListItem,
  ProjectSettingsViewModel,
  UserListItem
} from "@oops-ai/shared";

export const getProjects = (params: {
  page: number;
  pageSize: number;
  search?: string;
}) => {
  return http.request<ProjectPaginatedResult>("get", "/projects", { params });
};

export const getProject = (id: string) => {
  return http.request<ProjectViewModel>("get", `/projects/${id}`);
};

export const createProject = (data: CreateProjectSubmit) => {
  return http.request<CreateProjectResult>("post", "/projects", { data });
};

export const updateProject = (id: string, data: UpdateProjectSubmit) => {
  return http.request<UpdateProjectResult>("put", `/projects/${id}`, { data });
};

export const deleteProject = (id: string) => {
  return http.request<DeleteProjectResult>("delete", `/projects/${id}`);
};

export const getProjectMembers = (projectId: string) => {
  return http.request<ProjectMemberListItem[]>(
    "get",
    `/projects/${projectId}/members`
  );
};

export const addProjectMember = (
  projectId: string,
  data: AddProjectMemberSubmit
) => {
  return http.request<ProjectMemberListItem>(
    "post",
    `/projects/${projectId}/members`,
    { data }
  );
};

export const updateProjectMember = (
  projectId: string,
  userId: string,
  data: Partial<AddProjectMemberSubmit>
) => {
  return http.request<ProjectMemberListItem>(
    "put",
    `/projects/${projectId}/members/${userId}`,
    { data }
  );
};

export const removeProjectMember = (projectId: string, userId: string) => {
  return http.request<DeleteProjectResult>(
    "delete",
    `/projects/${projectId}/members/${userId}`
  );
};

export const getProjectSettings = (projectId: string) => {
  return http.request<ProjectSettingsViewModel>(
    "get",
    `/projects/${projectId}/settings`
  );
};

export const getAllUsers = () => {
  return http.request<UserListItem[]>("get", "/projects/users");
};
