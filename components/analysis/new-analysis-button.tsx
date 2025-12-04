'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

/**
 * New Analysis Button
 * 
 * Full-width button at the bottom of the analysis page to start a new swing analysis.
 * Routes to the new analysis flow page with inline processing.
 */
export function NewAnalysisButton() {
  const router = useRouter();

  return (
    <div className="pt-2 pb-6">
      <button
        type="button"
        onClick={() => router.push('/analysis/new')}
        className="w-full rounded-full bg-barrels-blue hover:bg-blue-500 active:bg-blue-600 text-white font-semibold text-sm md:text-base py-3 px-6 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        New Analysis
      </button>
    </div>
  );
}
