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
  return http.request<{ success: boolean; data: ProjectPaginatedResult }>(
    "get",
    "/projects",
    { params }
  );
};

export const getProject = (id: string) => {
  return http.request<{ success: boolean; data: ProjectViewModel }>(
    "get",
    `/projects/${id}`
  );
};

export const createProject = (data: CreateProjectSubmit) => {
  return http.request<{ success: boolean; data: CreateProjectResult }>(
    "post",
    "/projects",
    { data }
  );
};

export const updateProject = (id: string, data: UpdateProjectSubmit) => {
  return http.request<{ success: boolean; data: UpdateProjectResult }>(
    "put",
    `/projects/${id}`,
    { data }
  );
};

export const deleteProject = (id: string) => {
  return http.request<{ success: boolean; data: DeleteProjectResult }>(
    "delete",
    `/projects/${id}`
  );
};

export const getProjectMembers = (projectId: string) => {
  return http.request<{ success: boolean; data: ProjectMemberListItem[] }>(
    "get",
    `/projects/${projectId}/members`
  );
};

export const addProjectMember = (
  projectId: string,
  data: AddProjectMemberSubmit
) => {
  return http.request("post", `/projects/${projectId}/members`, { data });
};

export const updateProjectMember = (
  projectId: string,
  userId: string,
  data: Partial<AddProjectMemberSubmit>
) => {
  return http.request("put", `/projects/${projectId}/members/${userId}`, {
    data
  });
};

export const removeProjectMember = (projectId: string, userId: string) => {
  return http.request("delete", `/projects/${projectId}/members/${userId}`);
};

export const getProjectSettings = (projectId: string) => {
  return http.request<{ success: boolean; data: ProjectSettingsViewModel }>(
    "get",
    `/projects/${projectId}/settings`
  );
};

export const getAllUsers = () => {
  return http.request<{ success: boolean; data: UserListItem[] }>(
    "get",
    "/projects/users"
  );
};
