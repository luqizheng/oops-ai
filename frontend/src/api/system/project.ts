import { http } from "@/utils/http";
import type {
  CreateProjectSubmit,
  UpdateProjectSubmit,
  ProjectResult,
  ProjectPaginatedResult,
  ProjectMemberResult,
  AddProjectMemberSubmit,
  UserListItem
} from "@oops-ai/shared";

type ProjectListResponse = {
  success: boolean;
  data: ProjectPaginatedResult;
};

type ProjectSingleResponse = {
  success: boolean;
  data: ProjectResult;
};

type ProjectMembersResponse = {
  success: boolean;
  data: ProjectMemberResult[];
};

type UsersResponse = {
  success: boolean;
  data: UserListItem[];
};

export const getProjects = (params: {
  page: number;
  pageSize: number;
  search?: string;
}) => {
  return http.request<ProjectListResponse>("get", "/projects", { params });
};

export const getProject = (id: string) => {
  return http.request<ProjectSingleResponse>("get", `/projects/${id}`);
};

export const createProject = (data: CreateProjectSubmit) => {
  return http.request<ProjectSingleResponse>("post", "/projects", { data });
};

export const updateProject = (id: string, data: UpdateProjectSubmit) => {
  return http.request<ProjectSingleResponse>("put", `/projects/${id}`, {
    data
  });
};

export const deleteProject = (id: string) => {
  return http.request("delete", `/projects/${id}`);
};

export const getProjectMembers = (projectId: string) => {
  return http.request<ProjectMembersResponse>(
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

export const removeProjectMember = (projectId: string, userId: string) => {
  return http.request("delete", `/projects/${projectId}/members/${userId}`);
};

export const getAllUsers = () => {
  return http.request<UsersResponse>("get", "/users");
};
