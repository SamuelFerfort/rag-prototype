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
    // *** FIX HERE: Destructure 'projectId' and alias it to 'id' for internal use ***
    const { projectId: id, userIds, ...updateData } = data;

    // Start a transaction to handle user assignments
    // Use the correct type for the transaction client 'tx'
    return prisma.$transaction(async (tx) => {
      // Update basic project data
      // Use the 'id' variable (which holds the projectId value)
      const updatedProjectScalars = await tx.project.update({
        where: { id },
        data: updateData,
        // Include category here if needed, but users will be handled next
        // include: { category: true }
      });

      // If the project wasn't found, update would throw. If not, proceed.

      // --- User Assignment Logic (Your logic is good) ---
      // Delete existing user assignments for this project ID
      await tx.projectUser.deleteMany({
        where: { projectId: id }, // Use 'id' (which is projectId)
      });

      // Create new user assignments if userIds were provided and not empty
      if (userIds && userIds.length > 0) {
        await tx.projectUser.createMany({
          data: userIds.map((userId) => ({
            projectId: id, // Use 'id' (which is projectId)
            userId,
          })),
        });
      }
      // --- End User Assignment Logic ---

      // Fetch the final updated project with all includes needed by the UI/action
      // This ensures the returned object reflects the changes made in the transaction
      const finalProject = await tx.project.findUnique({
        where: { id }, // Use 'id' (which is projectId)
        include: {
          category: true, // Include category
          users: {
            // Include the updated users
            include: {
              user: true, // Include the nested user details
            },
          },
          // Include documents/memories if needed by the state/UI after update
          // documents: true,
          // memories: true,
        },
      });

      // If findUnique fails after update/create (very unlikely), it will return null.
      // The action calling this should handle null if necessary, but throwing might be better.
      if (!finalProject) {
        throw new Error(`Failed to retrieve project ${id} after update.`);
      }

      return finalProject; // Return the fully updated project with relations
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
  // Delete a project
  delete: async (id: string) => {
    return prisma.project.delete({
      where: { id },
    });
  },
};
