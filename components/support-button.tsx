'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ReportIssueModal } from './report-issue-modal';

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-[#E8B14E] to-[#F5C76E] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        title="Report an Issue"
      >
        <AlertCircle className="w-6 h-6 text-black" />
      </button>
      <ReportIssueModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
