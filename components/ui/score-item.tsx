import React from 'react';

/**
 * BARRELS Score Item Component
 * 
 * Consistent styling for all score displays (BARREL, Engine, Anchor, Whip)
 */

interface ScoreItemProps {
  label: string;
  value: number | string;
  large?: boolean;
  className?: string;
}

export function ScoreItem({ label, value, large = false, className = '' }: ScoreItemProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`font-semibold text-white ${large ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
        {typeof value === 'number' ? `${value}%` : value}
      </span>
      <span className="text-xs text-barrels-muted uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

/**
 * Grid layout for multiple score items
 */

interface ScoreGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ScoreGrid({ children, columns = 3, className = '' }: ScoreGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
