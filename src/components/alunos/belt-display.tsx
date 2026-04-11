import { belts } from "@/config/belts";
import { cn } from "@/lib/utils";

interface BeltDisplayProps {
  beltName: string;
  degree: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function BeltDisplay({ beltName, degree, size = "sm", showLabel = true }: BeltDisplayProps) {
  const belt = belts.find((b) => b.name === beltName);
  if (!belt) return null;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "relative flex items-center justify-end pr-1 gap-0.5 rounded-sm border border-border/50",
          belt.color,
          size === "sm" ? "h-4 w-16" : "h-6 w-24"
        )}
      >
        {Array.from({ length: degree }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-[1px]",
              belt.degrees.bg,
              size === "sm" ? "h-4 w-1" : "h-6 w-1.5"
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-foreground">
          {belt.label}
          {degree > 0 && ` ${degree}º grau`}
        </span>
      )}
    </div>
  );
}
