import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { imagesToPdf } from "@/utils/converters";
import { useRecordConversion } from "@/hooks/useQueries";
import { toast } from "sonner";
import { FileImage, Download, Loader2, CheckCircle } from "lucide-react";
import { saveAs } from "file-saver";

interface Props { onBack: () => void; }

export function ImageToPdf({ onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { mutate: recordConversion } = useRecordConversion();

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setProgress(10);
    setResultUrl(null);

    try {
      setProgress(30);
      const pdfBytes = await imagesToPdf(files);
      setProgress(90);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      recordConversion("image-to-pdf");
      toast.success("PDF created successfully!");
    } catch (err) {
      toast.error(`Conversion failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const name = files.length === 1 ? files[0].name.replace(/\.[^.]+$/, ".pdf") : "converted-images.pdf";
    saveAs(resultUrl, name);
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Combine one or more images into a single PDF document"
      icon={<FileImage className="w-8 h-8" />}
      accentColor="magenta"
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <DropZone
            accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
            multiple
            files={files}
            onFilesChange={setFiles}
            label="Drop images here (multiple allowed)"
            sublabel="JPG, PNG, GIF, WebP — in order of pages"
          />

          <Button
            onClick={handleConvert}
            disabled={files.length === 0 || isConverting}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-neon-magenta font-display font-semibold"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Building PDF...
              </>
            ) : (
              `Convert ${files.length > 0 ? files.length : ""} Image${files.length !== 1 ? "s" : ""} to PDF`
            )}
          </Button>

          {isConverting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Building your PDF...</p>
            </div>
          )}
        </div>

        {resultUrl && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-chart-3/10">
                <CheckCircle className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">PDF Ready!</p>
                <p className="text-xs text-muted-foreground">{files.length} image{files.length !== 1 ? "s" : ""} merged into one PDF</p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full gap-2 bg-chart-3/20 border border-chart-3/30 text-chart-3 hover:bg-chart-3/30 font-display font-semibold"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
