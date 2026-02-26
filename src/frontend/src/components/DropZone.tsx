import { useRef, useState, useCallback } from "react";
import { Upload, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/converters";

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  maxFiles?: number;
}

export function DropZone({
  accept,
  multiple = false,
  files,
  onFilesChange,
  label,
  sublabel,
  maxFiles,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = multiple
        ? maxFiles
          ? droppedFiles.slice(0, maxFiles)
          : droppedFiles
        : [droppedFiles[0]];

      onFilesChange(validFiles.filter(Boolean));
    },
    [multiple, maxFiles, onFilesChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      onFilesChange(selected);
      e.target.value = "";
    },
    [onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={cn(
          "w-full relative rounded-xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer text-left",
          "border-border hover:border-primary/40",
          "bg-secondary/20 hover:bg-primary/5",
          isDragging && "drop-zone-active",
          files.length > 0 && !isDragging && "border-primary/30 bg-primary/5"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center gap-3 text-center pointer-events-none select-none">
          <div
            className={cn(
              "p-4 rounded-full transition-all duration-300",
              isDragging
                ? "bg-primary/20 shadow-neon-cyan"
                : "bg-secondary/50"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          <div>
            <p className="font-display font-semibold text-foreground text-sm">
              {isDragging
                ? "Drop your files here"
                : label || "Drop files here or click to browse"}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {sublabel || `Accepts: ${accept}`}
            </p>
            {maxFiles && (
              <p className="text-muted-foreground text-xs">
                Max {maxFiles} file{maxFiles > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </button>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${file.size}-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border group"
            >
              <div className="p-1.5 rounded-md bg-primary/10">
                <FileIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono truncate text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
