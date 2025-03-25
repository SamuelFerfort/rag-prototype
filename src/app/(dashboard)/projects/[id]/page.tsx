import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { projectRepository } from "@/lib/db/projects";
import { getCurrentUserId } from "@/lib/session";
import { CalendarIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { NewMemoryDialog } from "./components/NewMemoryDialog";
import { DocumentUploader } from "@/components/common/DocumentUpload";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const userId = await getCurrentUserId();

    console.log("projectId", id);
    const project = await projectRepository.findProjectWithContent( id);

    if (!project) {
        notFound();
      }



   return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/projects">
            <Button variant="ghost" size="sm">← Volver</Button>
          </Link>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Memorias</h2>
          <NewMemoryDialog projectId={project.id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {project.memories.map((memory) => (
            <Link href={`/projects/${project.id}/memory/${memory.id}`} key={memory.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-medium text-lg mb-2">{memory.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-4">
                    {memory.content 
                      ? memory.content.replace(/<[^>]*>/g, '').slice(0, 100) + (memory.content.length > 100 ? '...' : '')
                      : 'Sin contenido'}
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(new Date(memory.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}

          <NewMemoryDialog projectId={project.id}>
            <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 h-full min-h-[200px] hover:bg-muted/50 transition-colors">
              <PlusIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nueva memoria</p>
            </div>
          </NewMemoryDialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Documentos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {project.documents?.map((document) => (
            <Card key={document.id} className="h-full hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg mb-2">{document.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {(document.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <div className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-6">
          <DocumentUploader projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
