import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { number: 1, label: "Dados Pessoais" },
  { number: 2, label: "Jiu-Jitsu" },
];

interface WizardStepperProps {
  currentStep: number;
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span className={cn("text-sm hidden sm:inline", isCurrent ? "text-foreground font-medium" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-px w-8 sm:w-12", isCompleted ? "bg-primary" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
