import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Default categories
  const categories = [
    "Medioambiental",
    "Urbanístico",
    "Industrial",
    "Energético",
    "Residuos",
    "Agua",
    "Otros",
  ];

  console.log("Seeding default categories...");

  for (const name of categories) {
    await prisma.projectCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
