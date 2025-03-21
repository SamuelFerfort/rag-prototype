// src/lib/db/repositories/documentRepository.ts

import prisma from "@/lib/db/prisma";

export type CreateDocumentData = {
  name: string;
  path: string;
  mimeType: string;
  size: number;
  projectId: string;
  vectorId?: string;
};

export const documentRepository = {
  // Find all documents for a project
  findByProject: async (projectId: string) => {
    return prisma.document.findMany({
      where: {
        projectId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  // Find a single document by ID
  findById: async (id: string) => {
    return prisma.document.findUnique({
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

  // Create a new document
  create: async (data: CreateDocumentData) => {
    return prisma.document.create({
      data: {
        name: data.name,
        path: data.path,
        mimeType: data.mimeType,
        size: data.size,
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

  // Update a document
  update: async (id: string, vectorId: string) => {
    return prisma.document.update({
      where: { id },
      data: {
        vectorId,
      },
    });
  },

  // Delete a document
  delete: async (id: string) => {
    return prisma.document.delete({
      where: { id },
    });
  },
};
