
'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon with gradient background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5A623]/20 to-purple-500/20 blur-2xl rounded-full" />
        <div className="relative bg-[#1e2837] p-6 rounded-2xl border border-white/10">
          <Icon className="w-12 h-12 text-[#F5A623]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && (
          <>
            {actionHref ? (
              <Link href={actionHref}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#F5A623] to-[#E89815] hover:from-[#E89815] hover:to-[#D88A0C] text-white shadow-lg shadow-orange-500/25"
                >
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg"
                onClick={onAction}
                className="bg-gradient-to-r from-[#F5A623] to-[#E89815] hover:from-[#E89815] hover:to-[#D88A0C] text-white shadow-lg shadow-orange-500/25"
              >
                {actionLabel}
              </Button>
            )}
          </>
        )}

        {secondaryActionLabel && (
          <>
            {secondaryActionHref ? (
              <Link href={secondaryActionHref}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/10 hover:border-white/20 hover:bg-white/5"
                >
                  {secondaryActionLabel}
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg"
                variant="outline"
                onClick={onSecondaryAction}
                className="border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
