"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableCell,
  TableBody,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { NewUserDialog } from "./NewUserDialog";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { UserBasic } from "@/lib/types/users";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";



export default function UsersTab({ users }: { users: UserBasic[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user: UserBasic) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Buscar perfil..."
          className="max-w-sm border-[#e4e4e7]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <NewUserDialog />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f8f8f8] hover:bg-[#f8f8f8]">
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
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-[#f8f8f8]">
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
          {filteredUsers.length} de {users.length} usuarios
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
    </>
  );
}
