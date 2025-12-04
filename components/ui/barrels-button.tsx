/**
 * BARRELS Standardized Button Component
 * 
 * Three variants:
 * - primary: Solid gold button with black text
 * - secondary: Outline gold button
 * - ghost: Low emphasis button
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface BarrelsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const BarrelsButton = React.forwardRef<HTMLButtonElement, BarrelsButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E8B14E] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-[#E8B14E] to-[#F5C76E] text-black hover:shadow-lg hover:shadow-[#E8B14E]/30 active:scale-95',
      secondary: 'border-2 border-[#E8B14E] text-[#E8B14E] bg-transparent hover:bg-[#E8B14E]/10 active:scale-95',
      ghost: 'text-gray-300 hover:text-[#E8B14E] hover:bg-[#E8B14E]/5 active:scale-95',
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

BarrelsButton.displayName = 'BarrelsButton';

export { BarrelsButton };
