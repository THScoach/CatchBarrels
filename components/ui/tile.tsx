import React from 'react';

/**
 * Standard BARRELS Tile Component
 * 
 * Use this for all dashboard cards, player profile sections, etc.
 * Maintains consistent styling across the app.
 */

interface TileProps {
  children: React.ReactNode;
  className?: string;
}

export function Tile({ children, className = '' }: TileProps) {
  return (
    <section 
      className={`
        rounded-2xl 
        bg-barrels-surface 
        border border-barrels-border 
        p-4 md:p-5 
        text-barrels-text
        shadow-[0_10px_25px_rgba(0,0,0,0.4)]
        ${className}
      `}
    >
      {children}
    </section>
  );
}

/**
 * Tile Header Component
 * Consistent header pattern for all tiles
 */

interface TileHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TileHeader({ title, subtitle, action }: TileHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-barrels-text uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-barrels-muted mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
