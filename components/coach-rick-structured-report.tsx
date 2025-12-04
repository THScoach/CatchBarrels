'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, TrendingUp, Eye, EyeOff, Lightbulb } from 'lucide-react';
import type { StructuredCoachReport } from '@/lib/momentum-coaching';

interface CoachRickStructuredReportProps {
  report: StructuredCoachReport;
  isAdmin?: boolean; // Show coach notes if admin
}

export function CoachRickStructuredReport({ report, isAdmin = false }: CoachRickStructuredReportProps) {
  const [showCoachNotes, setShowCoachNotes] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-barrels-gold/20 to-barrels-gold-light/10 border border-barrels-gold/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 rounded-lg bg-barrels-gold/20">
            <Lightbulb className="w-6 h-6 text-barrels-gold" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">Coach Rick's Full Analysis</h3>
            <p className="text-sm text-gray-400">Detailed breakdown of your swing mechanics and momentum transfer</p>
          </div>
        </div>
      </div>

      {/* Overview & Detail Paragraphs */}
      <div className="space-y-4">
        <div className="bg-barrels-black-light/50 border border-gray-800 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-barrels-gold uppercase tracking-wide mb-3">Overall Assessment</h4>
          <p className="text-gray-200 leading-relaxed">{report.overviewParagraph}</p>
        </div>

        <div className="bg-barrels-black-light/50 border border-gray-800 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-barrels-gold uppercase tracking-wide mb-3">Flow Path Breakdown</h4>
          <p className="text-gray-200 leading-relaxed">{report.detailParagraph}</p>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-700/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h4 className="text-lg font-bold text-white">What You Do Well</h4>
        </div>
        <ul className="space-y-3">
          {report.strengths.map((strength, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 text-gray-200"
            >
              <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-emerald-400" />
              <span>{strength}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Opportunities */}
      <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-700/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h4 className="text-lg font-bold text-white">Biggest Opportunities</h4>
        </div>
        <ul className="space-y-3">
          {report.opportunities.map((opportunity, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 text-gray-200"
            >
              <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-orange-400" />
              <span>{opportunity}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Next Session Focus */}
      <div className="bg-gradient-to-r from-barrels-gold/20 to-barrels-gold-light/10 border border-barrels-gold/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-barrels-gold" />
          <h4 className="text-lg font-bold text-white">Next Session Focus</h4>
        </div>
        <p className="text-gray-200 leading-relaxed">{report.nextSessionFocus}</p>
      </div>

      {/* Coach Notes (Admin Only) */}
      {isAdmin && (
        <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowCoachNotes(!showCoachNotes)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-purple-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showCoachNotes ? <EyeOff className="w-5 h-5 text-purple-400" /> : <Eye className="w-5 h-5 text-purple-400" />}
              <h4 className="text-lg font-bold text-white">Coach-Only Notes</h4>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-700/50 text-purple-200 rounded">ADMIN</span>
            </div>
            <span className="text-sm text-purple-400">{showCoachNotes ? 'Hide' : 'Show'}</span>
          </button>

          {showCoachNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6 space-y-4"
            >
              <div>
                <h5 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-2">Technical Observations</h5>
                <p className="text-gray-300 text-sm leading-relaxed">{report.coachNotes.technicalObservations}</p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-2">Progression Recommendations</h5>
                <p className="text-gray-300 text-sm leading-relaxed">{report.coachNotes.progressionRecommendations}</p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-2">Watch Points</h5>
                <p className="text-gray-300 text-sm leading-relaxed">{report.coachNotes.watchPoints}</p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
