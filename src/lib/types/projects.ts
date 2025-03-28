import {
  ClientType,
  Memory,
  Project,
  ProjectCategory,
  ProjectStatus,
  ProjectUser,
  User,
} from "@prisma/client";
import { z } from "zod";
import { updateProjectSchema } from "@/helpers/zod/projects-schema";

// Define types for our repository functions
export type ProjectWithRelations = Project & {
  category: ProjectCategory;
  _count: {
    memories: number;
    documents: number;
    users: number;
  };
};

export interface ExtendedProject extends Project {
  category: ProjectCategory;
  users: (ProjectUser & { user: User })[];
  documents: {
    id: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    vectorId: string | null;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
  }[];
  memories: {
    id: string;
    name: string;
    content: string | null;
    vectorId: string | null;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
  }[];
}

export interface ProjectTabsProps {
  project: ExtendedProject;
}

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

// Define the possible states returned by the action
export type UpdateProjectActionState = {
  status: "success" | "error" | "idle"; // idle is the initial state
  message?: string | null;
  errors?: Record<string, string[]> | null; // Matching Zod's flatten().fieldErrors
  updatedProject?: Project | null; // Optionally return updated data on success
  // We might not need 'values' if we rely on defaultValue, but keep if useful for complex scenarios
  // values?: Partial<z.infer<typeof updateProjectSchema>>;
};

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;
