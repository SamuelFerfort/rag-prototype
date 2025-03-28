"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { DeleteDocumentButton } from "@/components/common/DeleteDocumentButton";
import { DocumentUploader } from "@/components/common/DocumentUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProjectTabsProps,
  UpdateProjectActionState,
} from "@/lib/types/projects";
import { updateProject } from "@/lib/actions/projects";
import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserBasic } from "@/lib/types/users";
import { useEffect } from "react";

interface DetallesTabProps extends ProjectTabsProps {
  allUsers: UserBasic[];
}

const initialProjectState: UpdateProjectActionState = {
  status: "idle",
  message: null,
  errors: null,
  updatedProject: null,
};

export default function DetallesTab({ project, allUsers }: DetallesTabProps) {
  const [state, updateProjectAction, isPending] = useActionState(
    updateProject,
    initialProjectState
  );

  // Display toast notifications when state changes
  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
    if (state.status === "success" && state.message) {
      toast.success(state.message);
    }
  }, [state]);

  const defaultUserIds = project.users.map((user) => user.userId);

  return (
    <div className="space-y-8">
      {/* Información generales */}

      {/* --- Update Project Form --- */}
      {/* Pass the formAction dispatch function to the form */}
      <form action={updateProjectAction} className="space-y-8">
        {/* --- General Information Section --- */}
        <section>
          <h2 className="text-lg font-medium mb-4 border-b pb-2">
            Información general
          </h2>
          {/* Hidden input for projectId */}
          <input type="hidden" name="projectId" value={project.id} />
          {/* Hidden input for categoryId as it's disabled */}
          <input type="hidden" name="categoryId" value={project.categoryId} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* --- Name --- */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label> {/* Use Label */}
              <Input
                id="name"
                name="name" // Add name attribute
                placeholder="Nombre del proyecto"
                defaultValue={project.name} // Use defaultValue
                className="w-full border-zinc-300"
                aria-invalid={!!state.errors?.name} // Indicate invalid state
                aria-describedby="name-error"
              />
              {state.errors?.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {state.errors.name.join(", ")}
                </p>
              )}
            </div>

            {/* --- Status --- */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select name="status" defaultValue={project.status}>
                <SelectTrigger className="w-full border-zinc-300">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {/* Ensure values match Prisma enum names */}
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  {/* Add other statuses if they exist */}
                </SelectContent>
              </Select>
              {state.errors?.status && (
                <p className="text-sm text-red-500">
                  {state.errors.status.join(", ")}
                </p>
              )}
            </div>

            {/* --- Category (Display Only) --- */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              {/* Keep it disabled if not editable, value sent via hidden input */}
              <Input
                id="categoria"
                value={project.category.name}
                disabled
                className="w-full border-zinc-300 bg-gray-100" // Style disabled
              />
              {/* No error display needed if it's not submitted/validated */}
            </div>

            {/* --- Assigned Users (Multi-Select) --- */}
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="userIds">Usuarios asignados</Label>
              {/* Use native multi-select or a custom component */}
              <select
                id="userIds"
                name="userIds" // Critical: Name for formData.getAll('userIds')
                multiple // Enable multiple selections
                defaultValue={defaultUserIds} // Set default selected users
                className="w-full border-zinc-300 rounded-md p-2 h-32 border" // Basic styling
                aria-invalid={!!state.errors?.userIds}
                aria-describedby="userIds-error"
              >
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {state.errors?.userIds && (
                <p id="userIds-error" className="text-sm text-red-500">
                  {state.errors.userIds.join(", ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar
                múltiples usuarios.
              </p>
            </div>

            {/* --- Description --- */}
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="description">Descripción corta</Label>
              <Textarea
                id="description"
                name="description" // Add name attribute
                className="w-full min-h-[100px] border-zinc-300"
                defaultValue={project.description || ""} // Use defaultValue, handle null
                aria-invalid={!!state.errors?.description}
                aria-describedby="description-error"
              />
              {state.errors?.description && (
                <p id="description-error" className="text-sm text-red-500">
                  {state.errors.description.join(", ")}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* --- Client Information Section --- */}
        <section>
          <h2 className="text-lg font-medium mb-4 border-b pb-2">Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* --- Client Name --- */}
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre</Label>
              <Input
                id="clientName"
                name="clientName"
                placeholder="Nombre del cliente"
                className="w-full border-zinc-300"
                defaultValue={project.clientName || ""}
                aria-invalid={!!state.errors?.clientName}
                aria-describedby="clientName-error"
              />
              {state.errors?.clientName && (
                <p id="clientName-error" className="text-sm text-red-500">
                  {state.errors.clientName.join(", ")}
                </p>
              )}
            </div>

            {/* --- Client Location --- */}
            <div className="space-y-2">
              <Label htmlFor="clientLocation">Localidad</Label>
              <Input
                id="clientLocation"
                name="clientLocation"
                className="w-full border-zinc-300"
                defaultValue={project.clientLocation || ""}
                aria-invalid={!!state.errors?.clientLocation}
                aria-describedby="clientLocation-error"
              />
              {state.errors?.clientLocation && (
                <p id="clientLocation-error" className="text-sm text-red-500">
                  {state.errors.clientLocation.join(", ")}
                </p>
              )}
            </div>

            {/* --- Client Type --- */}
            <div className="space-y-2">
              <Label htmlFor="clientType">Tipo de cliente</Label>
              <Select name="clientType" defaultValue={project.clientType}>
                <SelectTrigger className="w-full border-zinc-300">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {/* Ensure values match Prisma enum names */}
                  <SelectItem value="PUBLICO">Público</SelectItem>
                  <SelectItem value="PRIVADO">Privado</SelectItem>
                  {/* Add other types if they exist */}
                </SelectContent>
              </Select>
              {state.errors?.clientType && (
                <p className="text-sm text-red-500">
                  {state.errors.clientType.join(", ")}
                </p>
              )}
            </div>

            {/* --- Client Description --- */}
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="clientDescription">
                Descripción sobre el cliente
              </Label>
              <Textarea
                id="clientDescription"
                name="clientDescription"
                className="w-full min-h-[100px] border-zinc-300"
                defaultValue={project.clientDescription || ""}
                aria-invalid={!!state.errors?.clientDescription}
                aria-describedby="clientDescription-error"
              />
              {state.errors?.clientDescription && (
                <p
                  id="clientDescription-error"
                  className="text-sm text-red-500"
                >
                  {state.errors.clientDescription.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* --- Submit Button --- */}
          <div className="flex justify-end mt-6">
            {/* Add type="submit" and handle pending state */}
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isPending} // Disable when pending
              aria-disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </section>
      </form>
      {/* Documentos - as a separate section */}
      <section>
        <h2 className="text-lg font-medium mb-4 border-b pb-2">Documentos</h2>

        <div className="mt-8">
          {project.documents && project.documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Link
                        href={document.path}
                        target="_blank"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span>{document.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {(document.size / (1024 * 1024)).toFixed(2)} MB
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(document.createdAt),
                        "dd/MM/yyyy HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteDocumentButton
                        documentId={document.id}
                        documentName={document.name}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              No hay documentos asociados a este proyecto
            </div>
          )}
        </div>
        <DocumentUploader projectId={project.id} />
      </section>
    </div>
  );
}
