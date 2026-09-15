"use client";

import { cn } from "@/lib/utils/helpers";
import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, options, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#a1a1c7]"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-violet-400" aria-hidden>*</span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "input-field px-4 py-3 text-base appearance-none pr-10 cursor-pointer",
              !props.value && "text-[#4b5563]",
              error && "border-red-500/70 focus:border-red-500",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#0f0f1e] text-[#f0f0ff]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none"
            aria-hidden
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5" role="alert">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#6b7280]">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
