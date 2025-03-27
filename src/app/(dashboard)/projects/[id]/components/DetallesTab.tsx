"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, File as FileIcon, X } from "lucide-react";
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

interface DetallesTabProps {
  projectId: string;
  documents: any[];
}

export default function DetallesTab({ projectId, documents }: DetallesTabProps) {
  return (
    <div className="space-y-8">
      {/* Información generales */}
      <section>
        <h2 className="text-lg font-medium mb-4 border-b pb-2">Información general</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="nombre" className="block text-sm font-medium">
              Nombre
            </label>
            <Input id="nombre" placeholder="Nombre del proyecto" className="w-full border-zinc-300" />
          </div>

          <div className="space-y-2">
            <label htmlFor="estado" className="block text-sm font-medium">
              Estado
            </label>
            <Select defaultValue="activo">
              <SelectTrigger className="w-full border-zinc-300">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="categoria" className="block text-sm font-medium">
              Categoría
            </label>
            <Select>
              <SelectTrigger className="w-full border-zinc-300">
                <SelectValue placeholder="Categoría del proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desarrollo">Desarrollo</SelectItem>
                <SelectItem value="diseno">Diseño</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <label htmlFor="usuarios" className="block text-sm font-medium">
              Usuarios asignados
            </label>
            <Select>
              <SelectTrigger className="w-full border-zinc-300">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user1">Usuario 1</SelectItem>
                <SelectItem value="user2">Usuario 2</SelectItem>
                <SelectItem value="user3">Usuario 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <label htmlFor="descripcion" className="block text-sm font-medium">
              Descripción corta
            </label>
            <Textarea id="descripcion" className="w-full min-h-[100px] border-zinc-300" />
          </div>
        </div>
      </section>

      {/* Cliente */}
      <section>
        <h2 className="text-lg font-medium mb-4 border-b pb-2">Cliente</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="nombreCliente" className="block text-sm font-medium">
              Nombre
            </label>
            <Input id="nombreCliente" placeholder="Nombre del cliente" className="w-full border-zinc-300" />
          </div>

          <div className="space-y-2">
            <label htmlFor="localidad" className="block text-sm font-medium">
              Localidad
            </label>
            <Input id="localidad" className="w-full border-zinc-300" />
          </div>

          <div className="space-y-2">
            <label htmlFor="tipoCliente" className="block text-sm font-medium">
              Tipo de cliente
            </label>
            <Select>
              <SelectTrigger className="w-full border-zinc-300">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empresa">Empresa</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="gobierno">Gobierno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <label htmlFor="descripcionCliente" className="block text-sm font-medium">
              Descripción sobre el cliente
            </label>
            <Textarea id="descripcionCliente" className="w-full min-h-[100px] border-zinc-300" />
          </div>
        </div>

        {/* Save button - directly below client description */}
        <div className="flex justify-end mt-6">
          <Button className="bg-[#09090b] text-white rounded-md">Guardar</Button>
        </div>
      </section>

      {/* Documentos - as a separate section */}
      <section>
        <h2 className="text-lg font-medium mb-4 border-b pb-2">Documentos</h2>
        
        <DocumentUploader projectId={projectId} />
        
        <div className="mt-8">
          {documents && documents.length > 0 ? (
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
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-5 w-5 text-blue-500" />
                        <span>{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{(document.size / (1024 * 1024)).toFixed(2)} MB</TableCell>
                    <TableCell>{format(new Date(document.createdAt), "dd/MM/yyyy HH:mm:ss")}</TableCell>
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
      </section>
    </div>
  );
} 