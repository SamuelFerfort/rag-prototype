import { Button } from "@/components/ui/button";
import { projectRepository } from "@/lib/db/projects";
import { getCurrentUserId } from "@/lib/session";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectTabs } from "./components/ProjectTabs";
import { userRepository } from "@/lib/db/users";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // This redirects if there is no user
  await getCurrentUserId();

  const project = await projectRepository.findProjectWithContent(id);
  const allUsers = await userRepository.findAll();

  if (!project) {
    notFound();
  }

  return (
    <div className=" space-y-8 w-full text-black ">
      {/* Project header with back button */}
      <div className="flex items-center border-b border-zinc-200 pb-5">
        <Button variant="ghost" size="icon" className="mr-2" asChild>
          <Link href="/projects">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{project.name}</h1>
      </div>

      {/* Tabs */}
      <ProjectTabs project={project} allUsers={allUsers} />
    </div>
  );
}
