import { http } from "@/utils/http";
import type {
  CreateUserSubmit,
  UpdateUserSubmit,
  CreateUserResult,
  UpdateUserResult,
  DeleteUserResult,
  UserPaginatedResult,
  UserViewModel,
  RoleListItem
} from "@oops-ai/shared";

export const getUsers = (params: {
  page: number;
  pageSize: number;
  search?: string;
}) => {
  return http.request<{ success: boolean; data: UserPaginatedResult }>(
    "get",
    "/users",
    { params }
  );
};

export const getUser = (id: string) => {
  return http.request<{ success: boolean; data: UserViewModel }>(
    "get",
    `/users/${id}`
  );
};

export const createUser = (data: CreateUserSubmit) => {
  return http.request<{ success: boolean; data: CreateUserResult }>(
    "post",
    "/users",
    { data }
  );
};

export const updateUser = (id: string, data: UpdateUserSubmit) => {
  return http.request<{ success: boolean; data: UpdateUserResult }>(
    "put",
    `/users/${id}`,
    { data }
  );
};

export const deleteUser = (id: string) => {
  return http.request<{ success: boolean; data: DeleteUserResult }>(
    "delete",
    `/users/${id}`
  );
};

export const getRoles = () => {
  return http.request<{ success: boolean; data: RoleListItem[] }>(
    "get",
    "/users/roles/list"
  );
};
