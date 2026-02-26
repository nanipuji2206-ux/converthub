import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { pdfToImages } from "@/utils/converters";
import { useRecordConversion } from "@/hooks/useQueries";
import { toast } from "sonner";
import { Image, Download, Loader2, FileImage } from "lucide-react";
import { saveAs } from "file-saver";

interface Props { onBack: () => void; }

export function PdfToImage({ onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ dataUrl: string; name: string }[]>([]);
  const { mutate: recordConversion } = useRecordConversion();

  const handleConvert = async () => {
    if (!files[0]) return;
    setIsConverting(true);
    setProgress(0);
    setResults([]);

    try {
      const images = await pdfToImages(files[0], format, (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      setResults(images);
      recordConversion("pdf-to-image");
      toast.success(`Converted ${images.length} page${images.length > 1 ? "s" : ""} successfully!`);
    } catch (err) {
      toast.error(`Conversion failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAll = () => {
    results.forEach(({ dataUrl, name }) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = name;
      link.click();
    });
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert each page of your PDF into high-quality JPG or PNG images"
      icon={<Image className="w-8 h-8" />}
      accentColor="cyan"
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <DropZone
            accept=".pdf,application/pdf"
            files={files}
            onFilesChange={setFiles}
            label="Drop your PDF here"
            sublabel="PDF files only"
          />

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground mb-2 block">Output Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as "jpg" | "png")}>
                <SelectTrigger className="bg-secondary/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG (smaller file size)</SelectItem>
                  <SelectItem value="png">PNG (lossless quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 flex items-end">
              <Button
                onClick={handleConvert}
                disabled={!files[0] || isConverting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-sm font-display font-semibold"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert PDF"
                )}
              </Button>
            </div>
          </div>

          {isConverting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Processing pages...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="progress-neon h-2" />
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">
                {results.length} Image{results.length > 1 ? "s" : ""} Ready
              </h3>
              {results.length > 1 && (
                <Button
                  onClick={downloadAll}
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((r) => (
                <div key={r.name} className="group relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={r.dataUrl}
                    alt={r.name}
                    className="w-full h-32 object-cover bg-secondary/20"
                  />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = r.dataUrl;
                        link.download = r.name;
                        link.click();
                      }}
                      className="bg-primary text-primary-foreground gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </Button>
                  </div>
                  <div className="p-2 bg-secondary/20">
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <FileImage className="w-3 h-3 shrink-0" />
                      {r.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
