import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { imageToDocx } from "@/utils/converters";
import { useRecordConversion } from "@/hooks/useQueries";
import { toast } from "sonner";
import { FileText, Download, Loader2, CheckCircle } from "lucide-react";
import { saveAs } from "file-saver";

interface Props { onBack: () => void; }

export function ImageToWord({ onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");
  const { mutate: recordConversion } = useRecordConversion();

  const handleConvert = async () => {
    if (!files[0]) return;
    setIsConverting(true);
    setProgress(20);
    setResultBlob(null);

    try {
      setProgress(50);
      const blob = await imageToDocx(files[0]);
      setProgress(100);
      setResultBlob(blob);
      setResultName(files[0].name.replace(/\.[^.]+$/, ".docx"));
      recordConversion("image-to-word");
      toast.success("Word document created!");
    } catch (err) {
      toast.error(`Conversion failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    saveAs(resultBlob, resultName);
  };

  return (
    <ToolLayout
      title="Image to Word"
      description="Embed your image into a .docx Word document"
      icon={<FileText className="w-8 h-8" />}
      accentColor="lime"
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <DropZone
            accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
            files={files}
            onFilesChange={setFiles}
            label="Drop an image here"
            sublabel="JPG, PNG, GIF, WebP"
          />

          <Button
            onClick={handleConvert}
            disabled={!files[0] || isConverting}
            className="w-full font-display font-semibold"
            style={{ background: "oklch(0.85 0.22 150 / 0.9)", color: "oklch(0.07 0.005 270)" }}
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Document...
              </>
            ) : (
              "Convert to Word"
            )}
          </Button>

          {isConverting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {resultBlob && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-chart-3/10">
                <CheckCircle className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">Document Ready!</p>
                <p className="text-xs text-muted-foreground font-mono">{resultName}</p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full gap-2 font-display font-semibold"
              style={{ background: "oklch(0.85 0.22 150 / 0.15)", color: "oklch(0.85 0.22 150)", border: "1px solid oklch(0.85 0.22 150 / 0.3)" }}
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download .docx
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
