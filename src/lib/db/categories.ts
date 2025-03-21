// src/lib/db/repositories/categoryRepository.ts

import prisma from "@/lib/db/prisma";


export const categoryRepository = {
  // Find all categories
  findAll: async () => {
    return prisma.projectCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  },
  
  // Find a single category by ID
  findById: async (id: string) => {
    return prisma.projectCategory.findUnique({
      where: { id }
    });
  },
  
  // Create a new category
  create: async (name: string) => {
    return prisma.projectCategory.create({
      data: {
        name
      }
    });
  },
  
  // Update a category
  update: async (id: string, name: string) => {
    return prisma.projectCategory.update({
      where: { id },
      data: {
        name
      }
    });
  },
  
  // Delete a category
  delete: async (id: string) => {
    return prisma.projectCategory.delete({
      where: { id }
    });
  },
  
  // Check if a category is in use
  isInUse: async (id: string) => {
    const count = await prisma.project.count({
      where: {
        categoryId: id
      }
    });
    
    return count > 0;
  },
  
  // Seed initial categories
  seedDefaultCategories: async () => {
    const defaultCategories = [
      "Medioambiental",
      "Urbanístico",
      "Industrial",
      "Energético",
      "Residuos",
      "Agua",
      "Otros"
    ];
    
    const results = [];
    
    // Create categories if they don't exist
    for (const name of defaultCategories) {
      const category = await prisma.projectCategory.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      
      results.push(category);
    }
    
    return results;
  }
};