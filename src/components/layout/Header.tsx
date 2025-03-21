import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SquareKanban, FolderKanban, Settings } from "lucide-react";
import SignOut from "@/components/auth/sign-out";
import { getCurrentUser } from "@/lib/session";
import Image from "next/image";
export async function Header() {
  const user = await getCurrentUser();

  return (
    <div className="border-b bg-white sticky top-0 z-50">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <Image
            src="/logo.png"
            alt="Sequoia Pro Logo"
            width={120}
            height={30}
            className="h-8 w-auto"
          />
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <SquareKanban className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <FolderKanban className="h-5 w-5" />
            <span>Proyectos</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 rounded-full text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-gray-50 p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage alt={user.name || "User avatar"} />
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500">Sequoia Pro Team</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-gray-700">
                Mi Cuenta
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <SignOut />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
