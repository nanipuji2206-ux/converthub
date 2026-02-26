import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mergePdfs } from "@/utils/converters";
import { useRecordConversion } from "@/hooks/useQueries";
import { toast } from "sonner";
import { GitMerge, Download, Loader2, CheckCircle, GripVertical, X } from "lucide-react";
import { saveAs } from "file-saver";
import { formatBytes } from "@/utils/converters";

interface Props { onBack: () => void; }

export function MergePdfs({ onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const { mutate: recordConversion } = useRecordConversion();

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const next = [...files];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setFiles(next);
  };

  const handleConvert = async () => {
    if (files.length < 2) {
      toast.error("Add at least 2 PDFs to merge");
      return;
    }
    setIsConverting(true);
    setProgress(10);
    setResultBytes(null);

    try {
      setProgress(40);
      const bytes = await mergePdfs(files);
      setProgress(100);
      setResultBytes(bytes);
      recordConversion("merge-pdfs");
      toast.success(`${files.length} PDFs merged successfully!`);
    } catch (err) {
      toast.error(`Merge failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes) return;
    const blob = new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    saveAs(blob, "merged.pdf");
  };

  return (
    <ToolLayout
      title="Merge PDFs"
      description="Combine multiple PDF files into a single document"
      icon={<GitMerge className="w-8 h-8" />}
      accentColor="cyan"
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <DropZone
            accept=".pdf,application/pdf"
            multiple
            files={[]}
            onFilesChange={(newFiles) => setFiles((prev) => [...prev, ...newFiles])}
            label="Drop PDFs here to add them"
            sublabel="Add multiple PDFs — arrange order below"
          />

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Merge order ({files.length} files)
              </p>
              <div className="space-y-1.5">
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${file.size}-${i}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="text-muted-foreground text-xs font-mono w-4 text-center">{i + 1}</div>
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveFile(i, i - 1)}
                        disabled={i === 0}
                        className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(i, i + 1)}
                        disabled={i === files.length - 1}
                        className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="p-1 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleConvert}
            disabled={files.length < 2 || isConverting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-sm font-display font-semibold"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Merging PDFs...
              </>
            ) : (
              `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`
            )}
          </Button>

          {isConverting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {resultBytes && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-chart-3/10">
                <CheckCircle className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">Merged PDF Ready!</p>
                <p className="text-xs text-muted-foreground">{formatBytes(resultBytes.length)}</p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full gap-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 font-display font-semibold"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download Merged PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
