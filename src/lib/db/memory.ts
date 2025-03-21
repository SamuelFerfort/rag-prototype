// src/lib/db/repositories/memoryRepository.ts

import prisma from "@/lib/db/prisma";

export type CreateMemoryData = {
  name: string;
  content: string;
  projectId: string;
  vectorId?: string;
};

export type UpdateMemoryData = {
  id: string;
  name?: string;
  content?: string;
  vectorId?: string;
};

export const memoryRepository = {
  // Find all memories for a project
  findByProject: async (projectId: string) => {
    return prisma.memory.findMany({
      where: {
        projectId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  // Find a single memory by ID
  findById: async (id: string) => {
    return prisma.memory.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            category: true,
          },
        },
      },
    });
  },

  // Create a new memory
  create: async (data: CreateMemoryData) => {
    return prisma.memory.create({
      data: {
        name: data.name,
        content: data.content,
        projectId: data.projectId,
        vectorId: data.vectorId,
      },
      include: {
        project: {
          include: {
            category: true,
          },
        },
      },
    });
  },

  // Update a memory
  update: async (data: UpdateMemoryData) => {
    const { id, ...updateData } = data;

    return prisma.memory.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          include: {
            category: true,
          },
        },
      },
    });
  },

  // Delete a memory
  delete: async (id: string) => {
    return prisma.memory.delete({
      where: { id },
    });
  },
};
