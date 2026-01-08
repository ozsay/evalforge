import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@lib/utils";

type CardVariant = "elevated" | "outlined" | "filled";

interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">>,
    HTMLMotionProps<"div"> {
  variant?: CardVariant;
  isHoverable?: boolean;
  isClickable?: boolean;
}

const variants: Record<CardVariant, string> = {
  elevated: "bg-white shadow-md border border-gray-100",
  outlined: "bg-white border border-gray-200",
  filled: "bg-gray-50 border border-gray-100",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "elevated",
      isHoverable = false,
      isClickable = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden",
          variants[variant],
          isClickable && "cursor-pointer",
          className
        )}
        whileHover={
          isHoverable || isClickable
            ? {
                y: -2,
                boxShadow:
                  "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
              }
            : undefined
        }
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// Sub-components
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-b border-gray-100", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 bg-gray-25 border-t border-gray-100 flex items-center gap-3",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

