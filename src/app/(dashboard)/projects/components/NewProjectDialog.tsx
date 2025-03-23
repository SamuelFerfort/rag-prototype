"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { createProject } from "@/lib/actions/projects";
import { ProjectStatus, ProjectCategory } from "@prisma/client";
import { UserBasic } from "@/lib/types/users";
import { ProjectFormState } from "@/helpers/zod/projects-schema";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ProjectCategory[];
  users: UserBasic[];
}

export function NewProjectDialog({
  open,
  onOpenChange,
  categories = [],
  users = [],
}: NewProjectDialogProps) {
  // Initialize form state with useActionState
  const initialState: ProjectFormState = {
    status: "idle",
    errors: {},
  };

  const [state, formAction, isPending] = useActionState(
    createProject,
    initialState
  );

  // Handle successful submission
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message || "Proyecto creado exitosamente");
      onOpenChange(false);
    }
  }, [state.status, state.message, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">
            Nuevo Proyecto
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo proyecto y asigna usuarios.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-5">
                <div>
                  <Label
                    htmlFor="name"
                    className={`block text-sm font-medium mb-1.5 ${
                      state.errors?.name ? "text-destructive" : ""
                    }`}
                  >
                    Nombre *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nombre del proyecto"
                    className={`w-full ${
                      state.errors?.name ? "border-destructive" : ""
                    }`}
                  />
                  {state.errors?.name && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.name[0]}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="categoryId"
                    className={`block text-sm font-medium mb-1.5 ${
                      state.errors?.categoryId ? "text-destructive" : ""
                    }`}
                  >
                    Categoría *
                  </Label>
                  <Select
                    name="categoryId"
                    defaultValue={state.data?.categoryId}
                  >
                    <SelectTrigger
                      className={`w-full ${
                        state.errors?.categoryId ? "border-destructive" : ""
                      }`}
                    >
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.categoryId && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.categoryId[0]}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="userIds"
                    className={`block text-sm font-medium mb-1.5 ${
                      state.errors?.userIds ? "text-destructive" : ""
                    }`}
                  >
                    Usuarios asignados * (aparte de ti)
                  </Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No hay usuarios disponibles
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center space-x-2 py-1"
                          >
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              name="userIds"
                              value={user.id}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor={`user-${user.id}`}
                              className="text-sm"
                            >
                              {user.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {state.errors?.userIds && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.userIds[0]}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#0f172a] hover:bg-[#1e293b]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Proyecto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
