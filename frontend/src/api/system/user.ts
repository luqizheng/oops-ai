import { http } from "@/utils/http";
import type {
  CreateUserSubmit,
  UpdateUserSubmit,
  UserResult,
  UserPaginatedResult,
  Role
} from "@oops-ai/shared";

type UserListResponse = {
  success: boolean;
  data: UserPaginatedResult;
};

type UserSingleResponse = {
  success: boolean;
  data: UserResult;
};

type RolesResponse = {
  success: boolean;
  data: Role[];
};

export const getUsers = (params: {
  page: number;
  pageSize: number;
  search?: string;
}) => {
  return http.request<UserListResponse>("get", "/users", { params });
};

export const getUser = (id: string) => {
  return http.request<UserSingleResponse>("get", `/users/${id}`);
};

export const createUser = (data: CreateUserSubmit) => {
  return http.request<UserSingleResponse>("post", "/users", { data });
};

export const updateUser = (id: string, data: UpdateUserSubmit) => {
  return http.request<UserSingleResponse>("put", `/users/${id}`, { data });
};

export const deleteUser = (id: string) => {
  return http.request("delete", `/users/${id}`);
};

export const getRoles = () => {
  return http.request<RolesResponse>("get", "/roles");
};
