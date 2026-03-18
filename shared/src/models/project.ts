// 项目模型
export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  settings: any;
  status: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 项目成员
export interface ProjectMember {
  projectId: string;
  userId: string;
  role: string;
  permissions: any;
  joinedAt: Date;
}

// 项目设置
export interface ProjectSettings {
  projectId: string;
  workflowConfig: any;
  notificationConfig: any;
  createdAt: Date;
  updatedAt: Date;
}
