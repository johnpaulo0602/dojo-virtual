import { Upload, FileText } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // bytes
  onUpload: (file: File) => Promise<void>;
  className?: string;
  uploading?: boolean;
}

export function FileUpload({ accept = ".pdf,.jpg,.jpeg,.png", maxSize = 5 * 1024 * 1024, onUpload, className, uploading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (maxSize && file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }
    await onUpload(file);
  }, [maxSize, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }, [handleFile]);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          uploading && "opacity-50 pointer-events-none",
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full border p-2.5">
            {uploading ? (
              <FileText className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium">{uploading ? "Enviando..." : "Arraste ou clique para enviar"}</p>
          <p className="text-xs text-muted-foreground">PDF, JPG ou PNG até {Math.round(maxSize / 1024 / 1024)}MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
