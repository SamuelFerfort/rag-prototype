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
    <div className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 sm:px-6 w-[95%] mx-auto">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <Image
            src="/logo.png"
            alt="Sequoia Pro Logo"
            width={120}
            height={30}
            className="h-8 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <SquareKanban className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <FolderKanban className="h-5 w-5" />
            <span className="font-medium">Proyectos</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Configuración</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 rounded-full text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 hover:bg-zinc-50 p-2 transition-colors">
                <Avatar className="h-8 w-8 border border-zinc-200">
                  <AvatarImage alt={user.name || "User avatar"} />
                  <AvatarFallback className="bg-zinc-100 text-zinc-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-zinc-900">
                    {user.name}
                  </div>
                  <div className="text-xs text-zinc-500">Sequoia Pro Team</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-zinc-200">
              <DropdownMenuLabel className="text-zinc-900">
                Mi Cuenta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-200" />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center text-zinc-700 hover:text-zinc-900 focus:text-zinc-900">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center text-zinc-700 hover:text-zinc-900 focus:text-zinc-900">
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200" />
              <DropdownMenuItem className="focus:bg-zinc-100 focus:text-zinc-900">
                <SignOut />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
