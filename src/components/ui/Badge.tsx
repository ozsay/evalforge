import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@lib/utils";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "gray";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  primary: "bg-primary-50 text-primary-700 border-primary-200",
  success: "bg-success-50 text-success-700 border-green-200",
  warning: "bg-warning-50 text-warning-700 border-amber-200",
  error: "bg-error-50 text-error-700 border-red-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-gray-500",
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
  gray: "bg-gray-400",
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full border",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Status badge with predefined mappings
type StatusType = "pending" | "running" | "completed" | "failed" | "cancelled";

const statusConfig: Record<
  StatusType,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: "gray", label: "Pending" },
  running: { variant: "primary", label: "Running" },
  completed: { variant: "success", label: "Completed" },
  failed: { variant: "error", label: "Failed" },
  cancelled: { variant: "warning", label: "Cancelled" },
};

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: StatusType;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} dot {...props}>
      {config.label}
    </Badge>
  );
}

// ==========================================
// Trend Badge - Shows improvement/regression
// ==========================================

type TrendDirection = "up" | "down" | "stable";

interface TrendBadgeProps {
  current: number;
  previous: number;
  inverse?: boolean;
  format?: "percent" | "currency" | "duration" | "number";
  threshold?: number;
  size?: BadgeSize;
  className?: string;
  iconOnly?: boolean;
}

export function TrendBadge({
  current,
  previous,
  inverse = false,
  className,
  iconOnly = false,
}: TrendBadgeProps) {
  const delta = current - previous;
  const percentChange = previous !== 0 ? ((delta / previous) * 100) : 0;
  const absPercentChange = Math.abs(percentChange);
  
  let direction: TrendDirection = "stable";
  if (absPercentChange < 3) {
    direction = "stable";
  } else if (delta > 0) {
    direction = "up";
  } else if (delta < 0) {
    direction = "down";
  }
  
  if (direction === "stable") {
    return null;
  }
  
  const isImproved = inverse ? direction === "down" : direction === "up";
  const isRegressed = inverse ? direction === "up" : direction === "down";
  
  const colorClass = isImproved 
    ? "text-success-600" 
    : isRegressed 
      ? "text-error-600" 
      : "text-gray-500";
  
  let displayValue = "";
  if (!iconOnly) {
    const sign = percentChange > 0 ? "+" : "";
    displayValue = `${sign}${percentChange.toFixed(0)}%`;
  }
  
  const Arrow = () => {
    if (direction === "up") {
      return (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };
  
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", colorClass, className)}>
      <Arrow />
      {displayValue}
    </span>
  );
}
