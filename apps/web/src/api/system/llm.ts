import { http } from "@/utils/http";
import type {
  CreateLLMConfigSubmit,
  UpdateLLMConfigSubmit,
  CreateLLMConfigResult,
  UpdateLLMConfigResult,
  DeleteLLMConfigResult,
  TestConnectionResult,
  LLMConfigListItem
} from "@oops-ai/shared";

export const getLLMConfigurations = () => {
  return http.request<LLMConfigListItem[]>("get", "/llm/configurations");
};

export const createLLMConfiguration = (data: CreateLLMConfigSubmit) => {
  return http.request<CreateLLMConfigResult>("post", "/llm/configurations", {
    data
  });
};

export const updateLLMConfiguration = (
  id: string,
  data: UpdateLLMConfigSubmit
) => {
  return http.request<UpdateLLMConfigResult>(
    "put",
    `/llm/configurations/${id}`,
    { data }
  );
};

export const deleteLLMConfiguration = (id: string) => {
  return http.request<DeleteLLMConfigResult>(
    "delete",
    `/llm/configurations/${id}`
  );
};

export const testLLMConnection = (id: string) => {
  return http.request<TestConnectionResult>(
    "post",
    `/llm/configurations/${id}/test`
  );
};

export const setDefaultLLMConfiguration = (id: string) => {
  return http.request<{ message: string }>(
    "put",
    `/llm/configurations/${id}/default`
  );
};
