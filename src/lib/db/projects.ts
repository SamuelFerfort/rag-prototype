// src/lib/db/repositories/projectRepository.ts

import { unstable_cache } from "next/cache";
import prisma from "@/lib/db/prisma";
import { ProjectStatus } from "@prisma/client";
import { CreateProjectData, UpdateProjectData } from "@/lib/types/projects";

// Project repository handles all database operations
export const projectRepository = {
  // Find all projects with optional filtering
  findAll: unstable_cache(
    async (filters?: {
      userId?: string;
      categoryId?: string;
      status?: ProjectStatus;
    }) => {
      const whereClause: any = {};

      if (filters?.userId) {
        whereClause.users = {
          some: {
            userId: filters.userId,
          },
        };
      }

      if (filters?.categoryId) {
        whereClause.categoryId = filters.categoryId;
      }

      if (filters?.status) {
        whereClause.status = filters.status;
      }

      return prisma.project.findMany({
        where: whereClause,
        include: {
          category: true,
          _count: {
            select: {
              memories: true,
              documents: true,
              users: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    },
    ["projects-findAll"],
    { tags: ["projects"] }
  ),

  // Find a single project by ID
  findById: unstable_cache(
    async (id: string) => {
      return prisma.project.findUnique({
        where: { id },
        include: {
          category: true,
          users: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              memories: true,
              documents: true,
            },
          },
        },
      });
    },
    ["project-findById"],
    { tags: ["projects", "project"] }
  ),

  // Create a new project (not cached - write operation)
  create: async (data: CreateProjectData) => {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || "ACTIVO",
        categoryId: data.categoryId,
        clientName: data.clientName,
        clientLocation: data.clientLocation,
        clientType: data.clientType,
        clientDescription: data.clientDescription,
        users: {
          create: data.userIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        category: true,
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  // Update an existing project (not cached - write operation)
  update: async (data: UpdateProjectData) => {
    const { projectId: id, userIds, ...updateData } = data;

    return prisma.$transaction(async (tx) => {
      const updatedProjectScalars = await tx.project.update({
        where: { id },
        data: updateData,
      });

      await tx.projectUser.deleteMany({
        where: { projectId: id },
      });

      if (userIds && userIds.length > 0) {
        await tx.projectUser.createMany({
          data: userIds.map((userId) => ({
            projectId: id,
            userId,
          })),
        });
      }

      const finalProject = await tx.project.findUnique({
        where: { id },
        include: {
          category: true,
          users: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!finalProject) {
        throw new Error(`Failed to retrieve project ${id} after update.`);
      }

      return finalProject;
    });
  },

  // Find a project with all its content (documents and memories)
  findProjectWithContent: unstable_cache(
    async (id: string, userId?: string) => {
      const whereClause: any = { id };

      if (userId) {
        whereClause.users = {
          some: {
            userId,
          },
        };
      }

      return prisma.project.findFirst({
        where: whereClause,
        include: {
          category: true,
          users: {
            include: {
              user: true,
            },
          },
          documents: {
            orderBy: {
              createdAt: "desc",
            },
          },
          memories: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    },
    ["project-findWithContent"],
    { tags: ["projects", "project", "documents", "memories"] }
  ),

  // Delete a project (not cached - write operation)
  delete: async (id: string) => {
    return prisma.project.delete({
      where: { id },
    });
  },
};
