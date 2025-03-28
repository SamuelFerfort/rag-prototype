import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderKanban, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">
              <FolderKanban className="mr-2 h-4 w-4" />
              Ver Proyectos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
