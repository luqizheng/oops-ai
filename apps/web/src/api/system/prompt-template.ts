import { http } from "@/utils/http";
import type {
  CreatePromptTemplateSubmit,
  UpdatePromptTemplateSubmit,
  CreatePromptTemplateResult,
  UpdatePromptTemplateResult,
  DeletePromptTemplateResult,
  PromptTemplateListItem,
  RenderTemplateResult,
  PromptTemplatePaginatedResult
} from "@oops-ai/shared";

export interface GetPromptTemplatesParams {
  category?: string;
  provider?: string;
  modelName?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const getPromptTemplates = (params?: GetPromptTemplatesParams) => {
  return http.request<PromptTemplatePaginatedResult>(
    "get",
    "/prompt-templates",
    {
      params
    }
  );
};

export const getPromptTemplateById = (id: string) => {
  return http.request<PromptTemplateListItem>("get", `/prompt-templates/${id}`);
};

export const createPromptTemplate = (data: CreatePromptTemplateSubmit) => {
  return http.request<CreatePromptTemplateResult>("post", "/prompt-templates", {
    data
  });
};

export const updatePromptTemplate = (
  id: string,
  data: UpdatePromptTemplateSubmit
) => {
  return http.request<UpdatePromptTemplateResult>(
    "put",
    `/prompt-templates/${id}`,
    { data }
  );
};

export const deletePromptTemplate = (id: string) => {
  return http.request<DeletePromptTemplateResult>(
    "delete",
    `/prompt-templates/${id}`
  );
};

export const setDefaultPromptTemplate = (id: string) => {
  return http.request<{ message: string }>(
    "put",
    `/prompt-templates/${id}/default`
  );
};

export const renderPromptTemplate = (
  id: string,
  variables: Record<string, any>
) => {
  return http.request<RenderTemplateResult>(
    "post",
    `/prompt-templates/${id}/render`,
    {
      data: variables
    }
  );
};
