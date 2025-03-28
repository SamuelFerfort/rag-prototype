import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userRepository } from "@/lib/db/users";
import { getCurrentUser } from "@/lib/session";
import UsersTab from "./components/UsersTab";
export default async function ConfiguracionPage() {
  // This already redirects to signin if we have no user
  await getCurrentUser();

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
          <TabsList className="bg-transparent p-0 h-auto border border-zinc-200 ">
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
          <UsersTab users={allUsers} />
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
