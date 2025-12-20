import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Card Component
export const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "bg-card/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-white/20", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 border-b border-white/5", className)} {...props}>{children}</div>
);

export const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-heading font-semibold text-foreground tracking-tight", className)} {...props}>{children}</h3>
);

export const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props}>{children}</div>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = ({ children, className, variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10 p-2 flex items-center justify-center",
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
};

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export const Badge = ({ children, className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "text-foreground border border-input",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
};

// Input Component
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

import * as TabsPrimitive from '@radix-ui/react-tabs';

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;
