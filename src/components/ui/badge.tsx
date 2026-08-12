import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
        success:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        emerald:
          "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-semibold",
        warning:
          "border border-amber-500/30 bg-amber-500/10 text-amber-300",
        outline:
          "border border-slate-700 bg-slate-800/40 text-slate-300",
        purple:
          "border border-purple-500/30 bg-purple-500/10 text-purple-300",
        pink:
          "border border-pink-500/40 bg-pink-500/15 text-pink-400 font-semibold",
        rose:
          "border border-rose-500/40 bg-rose-500/15 text-rose-400 font-semibold",
        gradient:
          "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-sm font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
