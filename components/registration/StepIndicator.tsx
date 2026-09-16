"use client";

import { cn } from "@/lib/utils/helpers";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-sm mx-auto mb-8">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300",
                  isComplete
                    ? "bg-violet-600 border-violet-600 text-white"
                    : isActive
                    ? "bg-transparent border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                    : "bg-transparent border-[#2a2a55] text-[#4b5563]"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isActive ? "text-violet-400" : isComplete ? "text-gray-600 dark:text-[#a1a1c7]" : "text-[#4b5563]"
                )}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3 mb-5">
                <div className="h-0.5 w-full bg-[#1e1e3f] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: isComplete ? "100%" : "0%" }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
