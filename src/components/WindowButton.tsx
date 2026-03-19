import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface WindowButtonProps {
  children: React.ReactNode;
  href?: string;
  to?: string;
  variant?: "primary" | "secondary";
  className?: string;
  icon?: React.ReactNode;
  autoShine?: boolean;
  disabled?: boolean;
}

const WindowButton = React.forwardRef<HTMLButtonElement, WindowButtonProps>(
  ({ children, href, to, variant = "secondary", className, icon, autoShine = false, disabled = false }, ref) => {
    const baseClasses = cn(
      "group relative overflow-hidden",
      "inline-flex items-center justify-center gap-2",
      "text-lg px-8 py-6 w-full sm:w-auto",
      "transition-all duration-300",
      "rounded-sm",
      // Window frame effect - double border
      "border-2",
      // Enhanced glass effect with backdrop blur and transparency
      "backdrop-blur-md",
      disabled 
        ? "opacity-50 cursor-not-allowed bg-white/5 text-primary-foreground/50 border-white/20"
        : variant === "primary" 
          ? "bg-accent/80 text-accent-foreground border-accent-foreground/30 hover:bg-accent/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_20px_rgba(0,0,0,0.2)]" 
          : "bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20 hover:border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_20px_rgba(0,0,0,0.15)]",
      className
    );

    const content = (
      <>
        {/* Window frame inner border */}
        <span className="absolute inset-[3px] border border-current/20 rounded-[2px] pointer-events-none" />
        
        {/* Window muntins (division lines) */}
        <span className="absolute inset-0 pointer-events-none">
          {/* Vertical line */}
          <span className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-current/10" />
          {/* Horizontal line */}
          <span className="absolute top-1/2 left-2 right-2 h-[1px] bg-current/10" />
        </span>

        {/* Animated light reflection */}
        <span 
          className={cn(
            "absolute inset-0 pointer-events-none",
            "before:absolute before:inset-0",
            "before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
            "before:w-[50%] before:-translate-x-full before:skew-x-[-20deg]",
            autoShine 
              ? "before:animate-window-shine-auto" 
              : "group-hover:before:animate-window-shine",
            "before:transition-transform"
          )}
        />

        {/* Glass reflection overlay - enhanced */}
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none" />
        <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        {/* Frame glow on hover */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.2)] pointer-events-none" />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon && <span className="w-5 h-5">{icon}</span>}
          {children}
        </span>
      </>
    );

    if (href) {
      return (
        <a href={href} className={baseClasses}>
          {content}
        </a>
      );
    }

    if (to) {
      return (
        <Link to={to} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={baseClasses} disabled={disabled}>
        {content}
      </button>
    );
  }
);

WindowButton.displayName = "WindowButton";

export { WindowButton };
