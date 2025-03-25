// src/components/common/DocumentUploader.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, File as FileIcon } from "lucide-react";
import { toast } from "sonner";
import { upload } from '@vercel/blob/client';
import { uploadDocument } from "@/lib/actions/documents";
import { storeProcessedDocument } from "@/lib/actions/storage";

const BACKEND_URL = process.env.NEXT_PUBLIC_DOCUMENT_PROCESSOR_URL;

interface DocumentUploaderProps {
  projectId: string;
  onUploadComplete?: () => void;
}

export function DocumentUploader({ projectId, onUploadComplete }: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatus("");
      setProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setStatus("");
      setProgress(0);
    }
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setStatus("");
    setProgress(0);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatus("Uploading to storage...");
    setProgress(10);
    
    try {
      // Step 1: Upload to Vercel Blob
      setStatus("Uploading to cloud storage...");
      const newBlob = await upload(selectedFile.name, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/blob/upload',
        clientPayload: JSON.stringify({ projectId }),
        multipart: selectedFile.size > 1024 * 1024 * 10,
        onUploadProgress: ({ percentage }) => {
          setProgress(20 + (percentage * 0.3)); // 20-50% progress during upload
        }
      });

      // Step 2: Send to Python backend for processing
      setStatus("Processing document content...");
      setProgress(60);
      
      // Create FormData for the Python backend
      const formData = new FormData();
      
      // Create a fetch request to download the file from the blob URL
      const fileResponse = await fetch(newBlob.url);
      const fileBlob = await fileResponse.blob();
      
      // Append the file and metadata to FormData
      formData.append("file", new window.File([fileBlob], selectedFile.name, { type: selectedFile.type }));
      formData.append("project_id", projectId);
      
      // Create temporary ID to be used for processing
      const tempId = `temp_${Date.now()}`;
      formData.append("metadata", JSON.stringify({
        tempId,
        projectId,
        filename: selectedFile.name,
      }));
      
      // Send to Python backend
      const processingResponse = await fetch(`${BACKEND_URL}/process`, {
        method: "POST",
        body: formData,
      });
      
      if (!processingResponse.ok) {
        throw new Error(`Processing error: ${processingResponse.status} ${processingResponse.statusText}`);
      }
      
      setProgress(85);
      setStatus("Generating embeddings...");
      
      // Get processing results
      const processingResult = await processingResponse.json();
      
      // Step 3: Use server action to create document and store embeddings
      const result = await uploadDocument({
        name: selectedFile.name,
        path: newBlob.url,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        projectId,
        chunks: processingResult.chunks,
        embeddings: processingResult.embeddings
      });
      
      if (!result.success) {
        throw new Error("Failed to store document");
      }
      
      setProgress(100);
      setStatus(`Success! Processed "${selectedFile.name}" into ${processingResult.count} chunks`);
      
      toast.success(`Documento "${selectedFile.name}" procesado exitosamente`);
      setSelectedFile(null);
      
      // Refresh the page to show the new document
      router.refresh();
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar el documento');
      setStatus(`Error: ${error instanceof Error ? error.message : "Error al procesar el documento"}`);
    } finally {
      setIsUploading(false);
    }
  };

  // List of supported file types
  const supportedFileTypes = ".pdf,.doc,.docx,.txt";

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={supportedFileTypes}
        />
        
        {selectedFile ? (
          <div className="space-y-1">
            <FileIcon className="h-8 w-8 mx-auto text-blue-500" />
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
            <p className="text-sm text-muted-foreground">
              Formatos soportados: PDF, DOCX, TXT
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="space-y-2">
          {isUploading ? (
            <>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{status}</p>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                className="bg-[#0f172a] hover:bg-[#1e293b]"
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir y procesar
              </Button>
              
              <Button
                variant="outline"
                onClick={resetUploader}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}