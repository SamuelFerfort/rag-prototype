"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { DeleteDocumentButton } from "@/components/common/DeleteDocumentButton";

interface DetallesTabProps {
  projectId: string;
  documents: any[];
}

export default function DetallesTab({ projectId, documents }: DetallesTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Documentos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents?.map((document) => (
          <Card
            key={document.id}
            className="border shadow-sm relative hover:bg-accent/50 transition-colors"
          >
            <DeleteDocumentButton
              documentId={document.id}
              documentName={document.name}
            />

            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-2">{document.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(document.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(document.createdAt), "dd/MM/yyyy HH:mm:ss")}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 