// app/coach/flags/page.tsx
'use client';
import { CoachLayout } from '@/components/coach/coach-layout';

export default function CoachFlagsPage() {
  return (
    <CoachLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-barrels-gold">Flags & Watchlist</h1>
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
          <p className="text-slate-400">
            TODO: Table of flagged players with severity, type, and action buttons.
          </p>
        </div>
      </div>
    </CoachLayout>
  );
}
