"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import {
  createUser,
  // Import state type
} from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { initialCreateUserState } from "@/lib/types/users";
import { CreateUserActionState } from "@/lib/types/users";

export function NewUserDialog() {
  const [open, setOpen] = useState(false);
  // Use the specific initial state and type
  const [state, formAction, isPending] = useActionState<
    CreateUserActionState,
    FormData
  >(
    createUser,
    initialCreateUserState // Use the imported initial state
  );

  // Handle action state changes for feedback
  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
      setOpen(false); // Close dialog on success
      // Optionally reset state if needed, though useActionState often handles this
    }
    // Show general errors if message exists and there are no specific field errors (or show both)
    if (state.status === "error" && state.message) {
      // Avoid showing duplicate toasts if field errors are also present and handled inline
      // You might only show this toast if state.errors is null or empty
      if (!state.errors || Object.keys(state.errors).length === 0) {
        toast.error(state.message);
      }
    }
  }, [state]); // Depend on the entire state object

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#09090b] hover:bg-[#3f3f46]">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border border-zinc-200">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            Nuevo Usuario
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-base">
            Crea un nuevo usuario para la plataforma.
          </DialogDescription>
        </DialogHeader>

        {/* General server error message area (optional, if not relying solely on toast) */}
        {state.status === "error" && state.message && !state.errors && (
          <div className="mb-4 text-red-600 text-sm bg-red-100 p-3 rounded-md">
            {state.message}
          </div>
        )}

        <form action={formAction} className="text-zinc-900" noValidate>
          {" "}
          {/* Add noValidate */}
          <div className="grid gap-6 w-full px-1">
            {/* --- Name Field --- */}
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium mb-1.5 text-zinc-700"
              >
                Nombre *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre completo"
                defaultValue={state.values?.name}
                className={`w-full ${
                  state.errors?.name ? "border-red-500" : "border-zinc-300"
                }`}
                required
                aria-invalid={!!state.errors?.name}
                aria-describedby="name-error"
              />
              {state.errors?.name && (
                <p id="name-error" className="mt-1 text-sm text-red-500">
                  {state.errors.name.join(", ")}
                </p>
              )}
            </div>

            {/* --- Email Field --- */}
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5 text-zinc-700"
              >
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={state.values?.email}
                placeholder="correo@ejemplo.com"
                className={`w-full ${
                  state.errors?.email ? "border-red-500" : "border-zinc-300"
                }`}
                required
                aria-invalid={!!state.errors?.email}
                aria-describedby="email-error"
              />
              {state.errors?.email && (
                <p id="email-error" className="mt-1 text-sm text-red-500">
                  {state.errors.email.join(", ")}
                </p>
              )}
            </div>

            {/* --- Password Field --- */}
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5 text-zinc-700"
              >
                Contraseña *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue={state.values?.password}
                placeholder="Mínimo 8 caracteres"
                className={`w-full ${
                  state.errors?.password ? "border-red-500" : "border-zinc-300"
                }`}
                required
                aria-invalid={!!state.errors?.password}
                aria-describedby="password-error"
              />
              {state.errors?.password && (
                <p id="password-error" className="mt-1 text-sm text-red-500">
                  {state.errors.password.join(", ")}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-8 gap-2">
            <Button
              type="button" // Keep as button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending} // Disable when submitting
              className="border-zinc-300 cursor-pointer text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Cancelar
            </Button>
            <Button
              type="submit" // Keep as submit
              className="text-white cursor-pointer bg-[#09090b] hover:bg-[#3f3f46]" // Ensure consistent styling
              disabled={isPending} // Disable when submitting
              aria-disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
