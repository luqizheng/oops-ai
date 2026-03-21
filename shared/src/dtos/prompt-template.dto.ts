export enum PromptTemplateCategory {
  RAW_TO_REQUIREMENT = 'raw-to-requirement',
  REQUIREMENT_TO_STORY = 'requirement-to-story',
  STORY_TO_USE_CASE = 'story-to-use-case',
  GENERATE_ACCEPTANCE = 'generate-acceptance',
  IDENTIFY_AMBIGUITY = 'identify-ambiguity',
  GENERATE_QUESTIONS = 'generate-questions',
  QUALITY_ASSESSMENT = 'quality-assessment',
  CODE_ANALYSIS = 'code-analysis',
  TEST_GENERATION = 'test-generation',
  OTHER = 'other'
}

export interface PromptTemplateListItem {
  id: string;
  name: string;
  description?: string;
  template: string;
  category: PromptTemplateCategory;
  provider?: string;
  modelName?: string;
  isDefault: boolean;
  isActive: boolean;
  variables?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PromptTemplateViewModel extends PromptTemplateListItem {}

export interface CreatePromptTemplateResult extends PromptTemplateViewModel {}

export interface UpdatePromptTemplateResult extends PromptTemplateViewModel {}

export interface DeletePromptTemplateResult {
  success: boolean;
  message?: string;
}

export interface RenderTemplateResult {
  success: boolean;
  message?: string;
  rendered?: string;
}

export interface ICreatePromptTemplateSubmit {
  name: string;
  description?: string;
  template: string;
  category: string;
  provider?: string;
  modelName?: string;
  isDefault?: boolean;
  isActive?: boolean;
  variables?: string[];
}

export interface IUpdatePromptTemplateSubmit {
  name?: string;
  description?: string;
  template?: string;
  category?: string;
  provider?: string;
  modelName?: string;
  isDefault?: boolean;
  isActive?: boolean;
  variables?: string[];
}
