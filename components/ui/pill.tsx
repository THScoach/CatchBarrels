import React from 'react';

/**
 * BARRELS Pill/Badge Component
 * 
 * Used for small labels, statuses, and metric identifiers
 */

type PillVariant = 'default' | 'gold' | 'blue';

interface PillProps {
  label: string;
  variant?: PillVariant;
  className?: string;
}

export function Pill({ label, variant = 'default', className = '' }: PillProps) {
  const variantStyles = {
    default: 'border-barrels-border bg-white/5 text-barrels-muted',
    gold: 'border-barrels-gold bg-barrels-gold/10 text-barrels-gold',
    blue: 'border-barrels-blue bg-barrels-blue/10 text-barrels-blue',
  };

  return (
    <span 
      className={`
        inline-flex items-center rounded-full border
        px-2.5 py-1 text-xs font-medium uppercase tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
    </span>
  );
}
