import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userRepository } from "@/lib/db/users";
import { MoreVertical, ArrowUpDown } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { NewUserDialog } from "./components/NewUserDialog";
export default async function ConfiguracionPage() {
  // This already redirects to signin if we have no user
  const user = await getCurrentUser();

  const allUsers = await userRepository.findAll();

  return (
    <main className="w-full pb-8 text-black">
      <div className="mb-8 border-b border-zinc-200 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Configuración
        </h1>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger
              value="usuarios"
              className="rounded-none px-6 py-2 data-[state=active]:bg-[#09090b] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Usuarios
            </TabsTrigger>
            <TabsTrigger
              value="campos"
              className="rounded-none px-6 py-2 data-[state=active]:bg-[#09090b] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Campos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="usuarios" className="mt-0">
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Buscar perfil..."
              className="max-w-sm border-[#e4e4e7]"
            />
            <NewUserDialog />
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f8f8f8] hover:bg-[#f8f8f8]">
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Nombre
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">Email</TableHead>

                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-[#f8f8f8]">
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image ?? ""} alt={user.name} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-[#71717a]">
            <div>
              {allUsers.length} de {allUsers.length} usuarios
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-[#71717a]"
                disabled
              >
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="text-[#71717a]">
                Siguiente
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campos">
          <div className="rounded-md border border-dashed p-8 text-center">
            <h3 className="font-medium">Configuración de Campos</h3>
            <p className="text-[#71717a]">Esta sección está en desarrollo</p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
