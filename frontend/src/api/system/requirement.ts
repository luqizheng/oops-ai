import { http } from "@/utils/http";
import type {
  CreateRequirementSubmit,
  UpdateRequirementSubmit,
  CreateRequirementResult,
  UpdateRequirementResult,
  DeleteRequirementResult,
  RequirementListItem,
  RawRequirement
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

export const getRawRequirementsByProject = (projectId: string) => {
  return http.request<RawRequirement[]>(
    "get",
    `/requirements/${projectId}/raw-requirements`
  );
};

export const getRawRequirement = (rawId: string) => {
  return http.request<RawRequirement>(
    "get",
    `/requirements/raw-requirements/${rawId}`
  );
};

export const createRawRequirement = (
  projectId: string,
  data: {
    content: string;
    sourceType?: string;
    sourceMeta?: any;
    proposedBy?: string;
    proposedAt?: Date;
    scenario?: string;
  }
) => {
  return http.request<RawRequirement>(
    "post",
    `/requirements/${projectId}/raw-requirements`,
    {
      data
    }
  );
};

export const updateRawRequirement = (
  rawId: string,
  data: {
    content?: string;
    sourceType?: string;
    sourceMeta?: any;
    proposedBy?: string;
    proposedAt?: Date;
    scenario?: string;
  }
) => {
  return http.request<RawRequirement>(
    "put",
    `/requirements/raw-requirements/${rawId}`,
    {
      data
    }
  );
};

export const deleteRawRequirement = (rawId: string) => {
  return http.request<{ message: string }>(
    "delete",
    `/requirements/raw-requirements/${rawId}`
  );
};

export const analyzeRequirement = (requirementText: string) => {
  return http.request<{
    analysisResults: string[];
    questions: string[];
  }>("post", "/requirements/ai/analyze/requirement", {
    data: { requirementText }
  });
};
