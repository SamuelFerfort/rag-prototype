"use client";

import { useState, useEffect, ReactNode } from "react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";

interface NewMemoryDialogProps {
  projectId: string;
  children?: ReactNode;
}

export function NewMemoryDialog({ projectId, children }: NewMemoryDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(
    createSimpleMemory,
    { status: "idle", errors: {} }
  );

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
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Nueva Memoria
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] text-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Nueva memoria</DialogTitle>
        </DialogHeader>
        
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="projectId" value={projectId} />
          
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base">
              Nombre
            </Label>
            <Input 
              id="name" 
              name="name"
              className="w-full text-base py-6"
              disabled={isPending}
              autoComplete="off"
              autoFocus
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-black hover:bg-black/90 text-base py-6"
          >
            {isPending ? "Creando..." : "Crear"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}