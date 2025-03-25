// src/lib/db/repositories/projectRepository.ts

import prisma from "@/lib/db/prisma";
import { ProjectStatus } from "@prisma/client";
import { CreateProjectData, UpdateProjectData } from "@/lib/types/projects";

// Project repository handles all database operations
export const projectRepository = {
  // Find all projects with optional filtering
  findAll: async (filters?: {
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

  // Find a single project by ID
  findById: async (id: string) => {
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

  // Create a new project
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

  // Update an existing project
  update: async (data: UpdateProjectData) => {
    const { id, userIds, ...updateData } = data;

    // Start a transaction to handle user assignments
    return prisma.$transaction(async (tx) => {
      // Update basic project data
      const project = await tx.project.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          users: {
            include: {
              user: true,
            },
          },
        },
      });

      // Update user assignments if provided
      if (userIds) {
        // Delete existing user assignments
        await tx.projectUser.deleteMany({
          where: { projectId: id },
        });

        // Create new user assignments
        if (userIds.length > 0) {
          await tx.projectUser.createMany({
            data: userIds.map((userId) => ({
              projectId: id,
              userId,
            })),
          });
        }

        // Fetch updated project with new user assignments
        return tx.project.findUnique({
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
      }

      return project;
    });
  },
// Find a project with all its content (documents and memories)
findProjectWithContent: async (id: string, userId?: string) => {
  const whereClause: any = { id };
  
  // If userId is provided, ensure the user has access to this project
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
          createdAt: 'desc',
        },
      },
      memories: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
},
  // Delete a project
  delete: async (id: string) => {
    return prisma.project.delete({
      where: { id },
    });
  },
};

