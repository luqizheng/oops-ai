import { http } from "@/utils/http";

export interface User {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
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
  data: PaginatedResult<User>;
};

type SingleResult = {
  success: boolean;
  data: User;
};

type RolesResult = {
  success: boolean;
  data: Role[];
};

export const getUsers = (params: PaginationParams) => {
  return http.request<ListResult>("get", "/users", { params });
};

export const getUser = (id: string) => {
  return http.request<SingleResult>("get", `/users/${id}`);
};

export const createUser = (data: CreateUserDto) => {
  return http.request<SingleResult>("post", "/users", { data });
};

export const updateUser = (id: string, data: UpdateUserDto) => {
  return http.request<SingleResult>("put", `/users/${id}`, { data });
};

export const deleteUser = (id: string) => {
  return http.request("delete", `/users/${id}`);
};

export const getRoles = () => {
  return http.request<RolesResult>("get", "/roles");
};
