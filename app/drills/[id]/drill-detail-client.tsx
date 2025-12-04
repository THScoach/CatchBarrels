'use client';

import { BottomNav } from '@/components/bottom-nav';
import { ChevronLeft, Video, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import Link from 'next/link';

export function DrillDetailClient({ drill }: any) {
  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          href="/drills"
          className="inline-flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Drills
        </Link>

        <h1 className="text-2xl font-bold text-white mb-4">{drill?.name}</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-[#F5A623]/20 text-[#F5A623] text-sm rounded-full">
            {drill?.category}
          </span>
          <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
            {drill?.difficulty}
          </span>
          <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
            {drill?.source}
          </span>
        </div>

        {/* Video Placeholder */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg aspect-video flex items-center justify-center mb-6">
          <Video className="w-16 h-16 text-gray-600" />
        </div>

        {/* Purpose */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-4">
          <h2 className="text-white font-semibold mb-2 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Purpose
          </h2>
          <p className="text-gray-300">{drill?.primaryPurpose}</p>
        </div>

        {/* Setup */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-4">
          <h2 className="text-white font-semibold mb-2 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-[#F5A623]" />
            Setup
          </h2>
          <p className="text-gray-300">{drill?.setup}</p>
        </div>

        {/* Execution */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-4">
          <h2 className="text-white font-semibold mb-2">Execution</h2>
          <p className="text-gray-300">{drill?.execution}</p>
        </div>

        {/* Key Points */}
        {drill?.keyPoints?.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-4">
            <h2 className="text-white font-semibold mb-3">Key Teaching Points</h2>
            <ul className="space-y-2">
              {drill.keyPoints.map((point: string, index: number) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-[#F5A623] mr-2">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes */}
        {drill?.commonMistakes?.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-4">
            <h2 className="text-white font-semibold mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              Common Mistakes
            </h2>
            <ul className="space-y-2">
              {drill.commonMistakes.map((mistake: string, index: number) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipment */}
        {drill?.equipment?.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-3">Equipment Needed</h2>
            <div className="flex flex-wrap gap-2">
              {drill.equipment.map((item: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
