import {
  ClientType,
  Project,
  ProjectCategory,
  ProjectStatus,
} from "@prisma/client";

// Define types for our repository functions
export type ProjectWithRelations = Project & {
  category: ProjectCategory;
  _count: {
    memories: number;
    documents: number;
    users: number;
  };
};

export type CreateProjectData = {
  name: string;
  description?: string;
  categoryId: string;
  clientName?: string;
  clientLocation?: string;
  clientType?: ClientType;
  clientDescription?: string;
  status?: ProjectStatus;
  userIds: string[];
};

export type UpdateProjectData = Partial<CreateProjectData> & {
  id: string;
};
