"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Calendar, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { Memory } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical } from "lucide-react"
import { useState } from "react"
import { deleteMemory } from "@/lib/actions/memories"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface MemoryCardProps {
  memory: Memory
  projectId: string
}

export default function MemoryCard({ memory, projectId }: MemoryCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDeleting(true)
    
    try {
      const result = await deleteMemory(memory.id)
      
      if (result.success) {
        toast.success("Memoria eliminada correctamente")
        router.refresh()
      } else {
        toast.error("Error al eliminar la memoria")
      }
    } catch (error) {
      console.error("Error deleting memory:", error)
      toast.error("Error al eliminar la memoria")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <Card className="border shadow-sm h-full hover:bg-accent/50 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <Link href={`/projects/${projectId}/memory/${memory.id}`}>
          <h3 className="font-medium">{memory.name}</h3>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.preventDefault()
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {memory.content
              ? memory.content.replace(/<[^>]*>/g, "").slice(0, 80) + (memory.content.length > 80 ? "..." : "")
              : "Sin contenido"}
          </p>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(memory.createdAt), "dd/MM/yyyy HH:mm:ss")}
          </div>
        </CardFooter>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la memoria &quot;{memory.name}&quot; y todos sus contenidos indexados.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

