// src/lib/db/repositories/userRepository.ts
import prisma from "@/lib/db/prisma";

export const userRepository = {
  // Find all users (optionally excluding the current user)
  findAll: async (options?: { excludeUserId?: string }) => {
    return prisma.user.findMany({
      where: options?.excludeUserId
        ? { id: { not: options.excludeUserId } }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  // Other user-related methods as needed
};
