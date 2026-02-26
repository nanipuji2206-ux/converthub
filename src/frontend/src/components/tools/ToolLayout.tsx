import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  accentColor?: "cyan" | "magenta" | "lime" | "amber";
  onBack: () => void;
  children: ReactNode;
}

const accentMap = {
  cyan: {
    glow: "shadow-neon-cyan",
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  magenta: {
    glow: "shadow-neon-magenta",
    text: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
  },
  lime: {
    glow: "",
    text: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/30",
  },
  amber: {
    glow: "",
    text: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/30",
  },
};

export function ToolLayout({
  title,
  description,
  icon,
  accentColor = "cyan",
  onBack,
  children,
}: ToolLayoutProps) {
  const accent = accentMap[accentColor];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8 animate-slide-up">
          <div
            className={cn(
              "p-3 rounded-xl border",
              accent.bg,
              accent.border,
              accent.glow
            )}
          >
            <div className={cn("w-8 h-8", accent.text)}>{icon}</div>
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s", opacity: 0, animation: "fade-in 0.5s ease-out 0.15s forwards" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
