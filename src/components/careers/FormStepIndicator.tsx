import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { STEP_LABELS } from "@/lib/schemas/applicationSchema";

interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function FormStepIndicator({
  currentStep,
  totalSteps,
}: FormStepIndicatorProps) {
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      {/* Progress bar */}
      <Progress value={progressValue} className="h-2 mb-6" />

      {/* Step indicators */}
      <div className="flex justify-between">
        {STEP_LABELS.map((label, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                index < currentStep &&
                  "bg-primary text-primary-foreground",
                index === currentStep &&
                  "bg-secondary text-secondary-foreground ring-2 ring-offset-2 ring-secondary",
                index > currentStep && "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "text-xs mt-2 text-center hidden md:block transition-colors",
                index === currentStep
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
