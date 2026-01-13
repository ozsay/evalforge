import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { isValidElement, createElement } from "react";
import { Button } from "./Button";
import { cn } from "@lib/utils";

interface EmptyStateProps {
  icon: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
}

// Check if something is a React component (function or ForwardRef)
function isReactComponent(value: unknown): value is React.ComponentType<{ className?: string }> {
  if (typeof value === "function") return true;
  // ForwardRef components have $$typeof Symbol
  if (typeof value === "object" && value !== null && "$$typeof" in value) {
    return true;
  }
  return false;
}

export function EmptyState({
  icon: IconOrElement,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {isReactComponent(IconOrElement) ? (
          createElement(IconOrElement, { className: "w-7 h-7 text-gray-400" })
        ) : isValidElement(IconOrElement) ? (
          IconOrElement
        ) : (
          <div className="text-gray-400">{IconOrElement as React.ReactNode}</div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action ? action : actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
}

