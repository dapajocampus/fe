"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-rose-500 text-white hover:bg-rose-600 shadow-md",
        glow:
          "bg-rose-500 text-white hover:bg-rose-600 shadow-md border border-rose-400/30",
        secondary:
          "bg-slate-800/80 text-slate-100 border border-slate-700/60 hover:bg-slate-700/80 backdrop-blur-md",
        outline:
          "border border-slate-700/80 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-sm",
        ghost:
          "text-slate-300 hover:bg-slate-800/60 hover:text-white",
        destructive:
          "bg-rose-700 text-white hover:bg-rose-600 shadow-md",
      },
      size: {
        sm: "h-9 px-3.5 text-xs rounded-lg",
        default: "h-11 px-5 py-2 text-sm",
        lg: "h-13 px-7 text-base rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "variant">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.15 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
