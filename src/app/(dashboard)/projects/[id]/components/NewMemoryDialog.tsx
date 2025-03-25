// src/app/(dashboard)/projects/[id]/components/NewMemoryDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createSimpleMemory } from "@/lib/actions/memories";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Loader2 } from "lucide-react";

interface NewMemoryDialogProps {
  projectId: string;
  children?: React.ReactNode;
}

export function NewMemoryDialog({ projectId, children }: NewMemoryDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Initial state for the form
  const initialState = {
    status: "idle",
    errors: {},
  };

  // Use action state for form handling
  const [state, formAction, isPending] = useActionState(
    createSimpleMemory,
    initialState
  );

  // Handle successful submission
  useEffect(() => {
    if (state.status === "success" && state.data?.id) {
      toast.success("Memoria creada exitosamente");
      setOpen(false);
      router.push(`/projects/${projectId}/memory/${state.data.id}`);
    }
  }, [state, router, projectId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Memoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva memoria</DialogTitle>
        </DialogHeader>
        
        <form action={formAction}>
          {/* Hidden input for projectId */}
          <input type="hidden" name="projectId" value={projectId} />
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la memoria</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Nombre descriptivo" 
                className={state.errors?.name ? "border-destructive" : ""}
              />
              {state.errors?.name && (
                <p className="text-sm text-destructive">{state.errors.name[0]}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}