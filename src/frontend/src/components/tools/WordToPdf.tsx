import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { docxToPdf } from "@/utils/converters";
import { useRecordConversion } from "@/hooks/useQueries";
import { toast } from "sonner";
import { File as FileIcon, Download, Loader2, CheckCircle } from "lucide-react";
import { saveAs } from "file-saver";

interface Props { onBack: () => void; }

export function WordToPdf({ onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [resultName, setResultName] = useState("");
  const { mutate: recordConversion } = useRecordConversion();

  const handleConvert = async () => {
    if (!files[0]) return;
    setIsConverting(true);
    setProgress(0);
    setResultBytes(null);

    try {
      setProgress(30);
      const bytes = await docxToPdf(files[0]);
      setProgress(100);
      setResultBytes(bytes);
      setResultName(files[0].name.replace(/\.docx?$/i, ".pdf"));
      recordConversion("word-to-pdf");
      toast.success("PDF created successfully!");
    } catch (err) {
      toast.error(`Conversion failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes) return;
    const blob = new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    saveAs(blob, resultName);
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert your .docx Word document to a PDF file"
      icon={<FileIcon className="w-8 h-8" />}
      accentColor="cyan"
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <DropZone
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            files={files}
            onFilesChange={setFiles}
            label="Drop your Word document here"
            sublabel=".doc or .docx files"
          />

          <Button
            onClick={handleConvert}
            disabled={!files[0] || isConverting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-sm font-display font-semibold"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting to PDF...
              </>
            ) : (
              "Convert to PDF"
            )}
          </Button>

          {isConverting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Extracting text and building PDF...</p>
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
                <p className="font-display font-semibold text-foreground">PDF Ready!</p>
                <p className="text-xs text-muted-foreground font-mono">{resultName}</p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full gap-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 font-display font-semibold"
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
