import { useState, useEffect, useRef } from "react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { compressImage, formatBytes } from "@/utils/converters";
import { useRecordConversion } from "@/hooks/useQueries";
import { toast } from "sonner";
import { Minimize2, Download, Loader2, CheckCircle } from "lucide-react";
import { saveAs } from "file-saver";

interface Props { onBack: () => void; }

export function ImageCompressor({ onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [isConverting, setIsConverting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevPreviewUrl = useRef<string | null>(null);
  const { mutate: recordConversion } = useRecordConversion();

  // Preview original image
  useEffect(() => {
    if (prevPreviewUrl.current) {
      URL.revokeObjectURL(prevPreviewUrl.current);
    }
    if (files[0]) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      prevPreviewUrl.current = url;
    } else {
      setPreviewUrl(null);
      prevPreviewUrl.current = null;
    }
    setResultBlob(null);
  }, [files]);

  const handleConvert = async () => {
    if (!files[0]) return;
    setIsConverting(true);
    setResultBlob(null);

    try {
      const blob = await compressImage(files[0], quality);
      setResultBlob(blob);
      const ext = "jpg";
      setResultName(files[0].name.replace(/\.[^.]+$/, `_compressed.${ext}`));
      recordConversion("image-compressor");

      const saved = files[0].size - blob.size;
      const savedPct = Math.round((saved / files[0].size) * 100);
      toast.success(`Compressed! Saved ${formatBytes(saved)} (${savedPct}% smaller)`);
    } catch (err) {
      toast.error(`Compression failed: ${err instanceof Error ? err.message : "Unknown error"}`);
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
      title="Image Compressor"
      description="Reduce image file size with adjustable quality settings"
      icon={<Minimize2 className="w-8 h-8" />}
      accentColor="magenta"
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <DropZone
            accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
            files={files}
            onFilesChange={setFiles}
            label="Drop an image to compress"
            sublabel="JPG, PNG, GIF, WebP"
          />

          {files[0] && previewUrl && (
            <div className="flex gap-3 items-start">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-border shrink-0"
              />
              <div>
                <p className="text-sm text-foreground font-mono">{files[0].name}</p>
                <p className="text-xs text-muted-foreground">Original: {formatBytes(files[0].size)}</p>
                {resultBlob && (
                  <p className="text-xs text-chart-3">
                    Compressed: {formatBytes(resultBlob.size)} ({Math.round((1 - resultBlob.size / files[0].size) * 100)}% saved)
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Quality</Label>
              <span className="text-sm font-mono font-bold text-primary">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={!files[0] || isConverting}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-neon-magenta font-display font-semibold"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Compressing...
              </>
            ) : (
              "Compress Image"
            )}
          </Button>
        </div>

        {resultBlob && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-chart-3/10">
                <CheckCircle className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">Compressed!</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(files[0]?.size ?? 0)} → {formatBytes(resultBlob.size)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full gap-2 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 font-display font-semibold"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download Compressed Image
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
