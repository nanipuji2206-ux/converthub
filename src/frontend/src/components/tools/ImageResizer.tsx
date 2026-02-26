import { useState, useEffect, useRef } from "react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { resizeImage, formatBytes } from "@/utils/converters";
import { useRecordConversion } from "@/hooks/useQueries";
import { toast } from "sonner";
import { Maximize2, Download, Loader2, CheckCircle, Link } from "lucide-react";
import { saveAs } from "file-saver";

interface Props { onBack: () => void; }

export function ImageResizer({ onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");
  const prevPreviewUrl = useRef<string | null>(null);
  const { mutate: recordConversion } = useRecordConversion();

  // Load original dimensions when file changes
  useEffect(() => {
    setResultBlob(null);
    if (!files[0]) {
      setOrigDims(null);
      setWidth("");
      setHeight("");
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(files[0]);
    if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current);
    prevPreviewUrl.current = url;

    img.onload = () => {
      URL.revokeObjectURL(url);
      setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    };
    img.src = url;
  }, [files]);

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (lockAspect && origDims && val) {
      const w = parseInt(val);
      if (!isNaN(w) && w > 0) {
        setHeight(String(Math.round((w * origDims.h) / origDims.w)));
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (lockAspect && origDims && val) {
      const h = parseInt(val);
      if (!isNaN(h) && h > 0) {
        setWidth(String(Math.round((h * origDims.w) / origDims.h)));
      }
    }
  };

  const handleConvert = async () => {
    if (!files[0]) return;
    const w = parseInt(width);
    const h = parseInt(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      toast.error("Please enter valid dimensions");
      return;
    }

    setIsConverting(true);
    setResultBlob(null);

    try {
      const blob = await resizeImage(files[0], w, h);
      setResultBlob(blob);
      setResultName(files[0].name.replace(/\.[^.]+$/, `_${w}x${h}.jpg`));
      recordConversion("image-resizer");
      toast.success(`Resized to ${w}×${h}px`);
    } catch (err) {
      toast.error(`Resize failed: ${err instanceof Error ? err.message : "Unknown error"}`);
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
      title="Image Resizer"
      description="Resize images to exact dimensions with optional aspect ratio lock"
      icon={<Maximize2 className="w-8 h-8" />}
      accentColor="amber"
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <DropZone
            accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
            files={files}
            onFilesChange={setFiles}
            label="Drop an image to resize"
            sublabel="JPG, PNG, GIF, WebP"
          />

          {origDims && (
            <div className="text-xs text-muted-foreground font-mono">
              Original: {origDims.w} × {origDims.h} px
            </div>
          )}

          <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Width (px)</Label>
              <Input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="bg-secondary/30 border-border font-mono"
                min={1}
                placeholder="Width"
              />
            </div>
            <div className="pb-2 flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setLockAspect(!lockAspect)}
                className={`p-1.5 rounded-md transition-colors ${lockAspect ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              >
                <Link className="w-4 h-4" />
              </button>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Height (px)</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="bg-secondary/30 border-border font-mono"
                min={1}
                placeholder="Height"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={lockAspect}
              onCheckedChange={setLockAspect}
              id="lock-aspect"
            />
            <Label htmlFor="lock-aspect" className="text-sm text-muted-foreground cursor-pointer">
              Lock aspect ratio
            </Label>
          </div>

          <Button
            onClick={handleConvert}
            disabled={!files[0] || isConverting || !width || !height}
            className="w-full font-display font-semibold"
            style={{ background: "oklch(0.78 0.2 75 / 0.9)", color: "oklch(0.07 0.005 270)" }}
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resizing...
              </>
            ) : (
              `Resize to ${width || "?"}×${height || "?"}px`
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
                <p className="font-display font-semibold text-foreground">Resized!</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(resultBlob.size)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full gap-2 font-display font-semibold"
              style={{ background: "oklch(0.78 0.2 75 / 0.15)", color: "oklch(0.78 0.2 75)", border: "1px solid oklch(0.78 0.2 75 / 0.3)" }}
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download Resized Image
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
