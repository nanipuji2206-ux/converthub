import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Shield, Zap, Heart, Image, FileText, File, Minimize2, Maximize2, GitMerge, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetTotalConversions } from "@/hooks/useQueries";
import { PdfToImage } from "@/components/tools/PdfToImage";
import { ImageToPdf } from "@/components/tools/ImageToPdf";
import { ImageToWord } from "@/components/tools/ImageToWord";
import { PdfToWord } from "@/components/tools/PdfToWord";
import { WordToPdf } from "@/components/tools/WordToPdf";
import { ImageCompressor } from "@/components/tools/ImageCompressor";
import { ImageResizer } from "@/components/tools/ImageResizer";
import { MergePdfs } from "@/components/tools/MergePdfs";
import { cn } from "@/lib/utils";

type ToolId =
  | "pdf-to-image"
  | "image-to-pdf"
  | "image-to-word"
  | "pdf-to-word"
  | "word-to-pdf"
  | "image-compressor"
  | "image-resizer"
  | "merge-pdfs"
  | null;

interface Tool {
  id: ToolId;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  glowColor: string;
  category: "pdf" | "image";
}

const TOOLS: Tool[] = [
  {
    id: "pdf-to-image",
    label: "PDF → Image",
    description: "Convert each PDF page into a high-res JPG or PNG image",
    icon: <Image className="w-6 h-6" />,
    accent: "from-primary/20 to-primary/5 border-primary/20 hover:border-primary/50",
    glowColor: "group-hover:shadow-neon-cyan",
    category: "pdf",
  },
  {
    id: "image-to-pdf",
    label: "Image → PDF",
    description: "Bundle one or more images into a single PDF document",
    icon: <FileText className="w-6 h-6" />,
    accent: "from-accent/20 to-accent/5 border-accent/20 hover:border-accent/50",
    glowColor: "group-hover:shadow-neon-magenta",
    category: "pdf",
  },
  {
    id: "image-to-word",
    label: "Image → Word",
    description: "Embed an image directly into an editable .docx document",
    icon: <File className="w-6 h-6" />,
    accent: "from-chart-3/20 to-chart-3/5 border-chart-3/20 hover:border-chart-3/50",
    glowColor: "",
    category: "pdf",
  },
  {
    id: "pdf-to-word",
    label: "PDF → Word",
    description: "Extract text from a PDF and export as an editable .docx",
    icon: <FileText className="w-6 h-6" />,
    accent: "from-chart-4/20 to-chart-4/5 border-chart-4/20 hover:border-chart-4/50",
    glowColor: "",
    category: "pdf",
  },
  {
    id: "word-to-pdf",
    label: "Word → PDF",
    description: "Convert your .docx Word document into a PDF file",
    icon: <File className="w-6 h-6" />,
    accent: "from-primary/20 to-primary/5 border-primary/20 hover:border-primary/50",
    glowColor: "group-hover:shadow-neon-cyan",
    category: "pdf",
  },
  {
    id: "image-compressor",
    label: "Image Compressor",
    description: "Shrink image file size with precision quality control",
    icon: <Minimize2 className="w-6 h-6" />,
    accent: "from-accent/20 to-accent/5 border-accent/20 hover:border-accent/50",
    glowColor: "group-hover:shadow-neon-magenta",
    category: "image",
  },
  {
    id: "image-resizer",
    label: "Image Resizer",
    description: "Resize to exact dimensions with aspect ratio lock",
    icon: <Maximize2 className="w-6 h-6" />,
    accent: "from-chart-4/20 to-chart-4/5 border-chart-4/20 hover:border-chart-4/50",
    glowColor: "",
    category: "image",
  },
  {
    id: "merge-pdfs",
    label: "Merge PDFs",
    description: "Combine multiple PDFs into one unified document",
    icon: <GitMerge className="w-6 h-6" />,
    accent: "from-primary/20 to-primary/5 border-primary/20 hover:border-primary/50",
    glowColor: "group-hover:shadow-neon-cyan",
    category: "pdf",
  },
];

function HomePage({ onToolSelect }: { onToolSelect: (id: ToolId) => void }) {
  const { data: totalConversions } = useGetTotalConversions();

  return (
    <div className="min-h-screen gradient-bg scanline-bg">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-float-orb opacity-20"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.25 195 / 0.5) 0%, transparent 70%)",
            top: "10%",
            left: "5%",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-float-orb opacity-15"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.28 315 / 0.5) 0%, transparent 70%)",
            bottom: "20%",
            right: "10%",
            animationDelay: "-4s",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full animate-float-orb opacity-10"
          style={{
            background: "radial-gradient(circle, oklch(0.78 0.22 150 / 0.4) 0%, transparent 70%)",
            top: "50%",
            right: "30%",
            animationDelay: "-8s",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/assets/generated/logo-transparent.dim_64x64.png"
                alt="ConvertHub logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-foreground tracking-tight">
                Convert<span className="text-primary neon-text-cyan">Hub</span>
              </span>
            </div>
          </div>

          {totalConversions !== undefined && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
              {totalConversions.toString()} conversions done
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="animate-slide-up stagger-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-chart-3/30 bg-chart-3/10 text-chart-3 text-xs font-mono mb-6">
              <Shield className="w-3.5 h-3.5" />
              Your files never leave your browser — 100% private
            </div>
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-7xl leading-none tracking-tighter mb-6 animate-slide-up stagger-2">
            <span className="text-foreground">Convert</span>
            <br />
            <span className="text-primary neon-text-cyan animate-flicker">anything.</span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto font-mono leading-relaxed animate-slide-up stagger-3">
            PDFs, images, Word docs — transformed instantly in your browser.
            <br />
            No uploads. No accounts. No nonsense.
          </p>

          {totalConversions !== undefined && totalConversions > BigInt(0) && (
            <div className="mt-6 animate-slide-up stagger-4">
              <span className="text-sm text-muted-foreground font-mono">
                <span className="text-primary font-bold">{totalConversions.toString()}</span> files converted so far
              </span>
            </div>
          )}
        </section>

        {/* Tools grid */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="mb-8 animate-slide-up stagger-4">
            <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-widest">
              8 Conversion Tools
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool, i) => (
              <div
                key={tool.id}
                className={cn(
                  "animate-slide-up",
                  `stagger-${Math.min(i + 1, 8)}`
                )}
              >
                <button
                  type="button"
                  onClick={() => onToolSelect(tool.id)}
                  className={cn(
                    "group w-full text-left p-5 rounded-xl border",
                    "bg-gradient-to-br transition-all duration-300",
                    "backdrop-blur-sm",
                    tool.accent,
                    tool.glowColor,
                    "hover:translate-y-[-2px]"
                  )}
                >
                  <div className="mb-4">
                    <div
                      className={cn(
                        "inline-flex p-2.5 rounded-lg transition-all duration-300",
                        "bg-background/40 group-hover:bg-background/60"
                      )}
                    >
                      <span className="text-foreground">{tool.icon}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-sm text-foreground mb-1.5 leading-tight">
                    {tool.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-primary group-hover:gap-2.5 transition-all">
                    <span>Use Tool</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Features bar */}
        <section className="border-t border-border/50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: <Shield className="w-5 h-5" />, label: "100% Private", desc: "Files processed in-browser only" },
                { icon: <Zap className="w-5 h-5" />, label: "Instant", desc: "No upload wait times" },
                { icon: <FileText className="w-5 h-5" />, label: "8 Tools", desc: "PDF, Image & Word conversion" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-2">
                  <div className="text-primary">{f.icon}</div>
                  <p className="font-display font-bold text-sm text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            © 2026. Built with <Heart className="inline w-3 h-3 text-accent" /> using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  const handleBack = () => setActiveTool(null);

  if (activeTool === "pdf-to-image") return <><PdfToImage onBack={handleBack} /><Toaster /></>;
  if (activeTool === "image-to-pdf") return <><ImageToPdf onBack={handleBack} /><Toaster /></>;
  if (activeTool === "image-to-word") return <><ImageToWord onBack={handleBack} /><Toaster /></>;
  if (activeTool === "pdf-to-word") return <><PdfToWord onBack={handleBack} /><Toaster /></>;
  if (activeTool === "word-to-pdf") return <><WordToPdf onBack={handleBack} /><Toaster /></>;
  if (activeTool === "image-compressor") return <><ImageCompressor onBack={handleBack} /><Toaster /></>;
  if (activeTool === "image-resizer") return <><ImageResizer onBack={handleBack} /><Toaster /></>;
  if (activeTool === "merge-pdfs") return <><MergePdfs onBack={handleBack} /><Toaster /></>;

  return (
    <>
      <HomePage onToolSelect={setActiveTool} />
      <Toaster />
    </>
  );
}
