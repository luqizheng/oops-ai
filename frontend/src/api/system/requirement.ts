import { http } from "@/utils/http";
import type {
  CreateRequirementSubmit,
  UpdateRequirementSubmit,
  CreateRequirementResult,
  UpdateRequirementResult,
  DeleteRequirementResult,
  RequirementListItem
} from "@oops-ai/shared";

export const getRequirementsByProject = (
  projectId: string,
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    priority?: string;
  }
) => {
  return http.request<RequirementListItem[]>(
    "get",
    `/requirements/project/${projectId}`,
    { params }
  );
};

export const getRequirement = (id: string) => {
  return http.request<any>("get", `/requirements/${id}`);
};

export const createRequirement = (data: CreateRequirementSubmit) => {
  return http.request<CreateRequirementResult>("post", "/requirements", {
    data
  });
};

export const updateRequirement = (
  id: string,
  data: UpdateRequirementSubmit
) => {
  return http.request<UpdateRequirementResult>("put", `/requirements/${id}`, {
    data
  });
};

export const deleteRequirement = (id: string) => {
  return http.request<DeleteRequirementResult>("delete", `/requirements/${id}`);
};

export const updateRequirementStatus = (id: string, status: string) => {
  return http.request<UpdateRequirementResult>(
    "put",
    `/requirements/${id}/status`,
    {
      data: { status }
    }
  );
};

export const assignRequirement = (id: string, assigneeId: string) => {
  return http.request<UpdateRequirementResult>(
    "put",
    `/requirements/${id}/assign`,
    {
      data: { assigneeId }
    }
  );
};

export const getRequirementDetails = (id: string) => {
  return http.request<any>("get", `/requirements/${id}/details`);
};
