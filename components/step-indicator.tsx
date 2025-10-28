import { Check } from "lucide-react"

interface StepIndicatorProps {
  currentStep: "original" | "correction" | "audio"
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8 mt-16 lg:mt-0">
      <div
        className={`flex items-center gap-2 ${currentStep === "original" || currentStep === "correction" ? "text-foreground" : "text-muted-foreground"}`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
            currentStep === "original" || currentStep === "correction"
              ? "border-foreground bg-foreground text-background"
              : currentStep === "audio"
                ? "border-primary bg-primary text-background"
                : "border-muted-foreground bg-transparent"
          }`}
        >
          {currentStep === "audio" ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <span className="text-sm font-medium">Text Correction</span>
      </div>

      <div className={`w-8 h-0.5 ${currentStep === "audio" ? "bg-primary" : "bg-muted-foreground"}`}></div>

      <div className={`flex items-center gap-2 ${currentStep === "audio" ? "text-foreground" : "text-muted-foreground"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
            currentStep === "audio" ? "border-foreground bg-foreground text-background" : "border-muted-foreground bg-transparent"
          }`}
        >
          2
        </div>
        <span className="text-sm font-medium">Audio Record</span>
      </div>
    </div>
  )
}

