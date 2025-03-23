import { projectRepository } from "@/lib/db/projects";
import { categoryRepository } from "@/lib/db/categories";
import { userRepository } from "@/lib/db/users";
import { getCurrentUserId } from "@/lib/session";
import ProjectList from "./components/ProjectList";
export default async function ProjectsPage() {
  const userId = await getCurrentUserId();

  const [projects, categories, users] = await Promise.all([
    projectRepository.findAll({ userId }),
    categoryRepository.findAll(),
    userRepository.findAll({ excludeUserId: userId }),
  ]);

  return (
    <ProjectList projects={projects} categories={categories} users={users} />
  );
}
