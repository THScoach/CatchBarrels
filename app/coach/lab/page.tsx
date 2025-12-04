// app/coach/lab/page.tsx
// Coach Rick AI Lab - Data Analysis & Insights
// Version: 1.0
// Date: November 26, 2025

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, Filter, Calendar, Users, TrendingUp } from 'lucide-react';
import { CoachLayout } from '@/components/coach/coach-layout';

type MetricFocus = 'momentumTransfer' | 'flowLanes' | 'timing' | 'ballData';

export default function CoachLabPage() {
  const [question, setQuestion] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [metricFocus, setMetricFocus] = useState<MetricFocus>('momentumTransfer');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async () => {
    setLoading(true);
    
    // TODO: Implement DeepAgent API call
    // const payload = {
    //   question,
    //   filters: {
    //     programId: selectedProgram !== 'all' ? selectedProgram : undefined,
    //     dateRange: { start: '2025-01-01', end: '2025-01-31' },
    //     metricFocus,
    //   },
    // };
    // const result = await fetch('/api/coach/ai-lab/query', {
    //   method: 'POST',
    //   body: JSON.stringify(payload),
    // });
    // const data = await result.json();
    // setResponse(data);
    
    // Mock response for demo
    setTimeout(() => {
      setResponse({
        summary: [
          'Your 14U group is improving in timing (avg A:B ratio up 0.2 over last 3 weeks)',
          'Barrel flow is the weakest lane for 7/12 players in this cohort',
          '3 players have timing regression flags - need immediate attention',
        ],
        dataInterpretation: 'Based on the last 30 days, your 14U hitters are showing solid progress in timing fundamentals. Average Momentum Transfer score has moved from 68 to 72, which is encouraging. However, barrel flow remains the most common weak lane, suggesting that while energy is getting started on time, it\'s not being delivered cleanly into the barrel. This is typical for this age group as they develop coordination between lower body power and hand path control.',
        actionPlan: [
          'For the next 2 weeks, structure sessions to protect timing first - don\'t overload with barrel path corrections yet',
          'Add simple barrel flow constraints (tee work with target focus) after warmup, once timing is repeating',
          'Flag the 3 timing regression players for 1-on-1 video review - likely fatigue or overtraining',
          'Track A:B ratio in every session for the flagged players to confirm if timing stabilizes',
          'Reassess in 2 weeks - if barrel flow scores don\'t move up, consider adjusting drill difficulty',
        ],
        followUpPrompts: [
          'Which players have the worst barrel flow in my 14U group?',
          'Compare Jayden\'s timing pattern to the team average',
          'Show me ground flow trends over the last 6 weeks',
          'Explain the difference between timing and sequence quality',
        ],
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Brain size={32} className="text-barrels-gold" />
            <div>
              <h1 className="text-3xl font-bold text-barrels-gold">Coach Rick AI Lab</h1>
              <p className="text-slate-400 mt-1">
                Ask questions about your hitters' data and trends
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-barrels-gold" />
            <h2 className="text-lg font-semibold text-slate-200">Data Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Program Filter */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                <Users size={14} className="inline mr-1" />
                Program/Team
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
              >
                <option value="all">All Programs</option>
                <option value="4b-winter">4B Winter Hybrid</option>
                <option value="elite-90">Elite 90 Day</option>
                <option value="14u">14U Team</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Date Range
              </label>
              <select
                className="w-full px-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
              >
                <option value="7d">Last 7 Days</option>
                <option value="14d">Last 14 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            {/* Metric Focus */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                <TrendingUp size={14} className="inline mr-1" />
                Metric Focus
              </label>
              <select
                value={metricFocus}
                onChange={(e) => setMetricFocus(e.target.value as MetricFocus)}
                className="w-full px-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
              >
                <option value="momentumTransfer">Momentum Transfer</option>
                <option value="flowLanes">Flow Lanes</option>
                <option value="timing">Timing & Sequence</option>
                <option value="ballData">Ball Data</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Question Input */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            What are you curious about?
          </h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="E.g., What should I focus on with my 14U group over the next 2 weeks?"
            className="w-full p-4 bg-slate-800 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
            rows={4}
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !question}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-black rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-barrels-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Ask Coach Rick AI</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 mt-3">
            TODO: Integrate with DeepAgent AI (see docs/coach-rick-ai-lab-system-prompt.md)
          </p>
        </motion.div>

        {/* Results Area */}
        {response && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Summary */}
            <div className="bg-gradient-to-br from-barrels-gold/10 to-barrels-gold-light/5 border border-barrels-gold/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-barrels-gold mb-4">
                Coach Summary
              </h3>
              <ul className="space-y-2">
                {response.summary.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-200 flex items-start gap-2">
                    <span className="text-barrels-gold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Interpretation */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                What the Data Is Saying
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {response.dataInterpretation}
              </p>
            </div>

            {/* Action Plan */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                What You Should Do Next
              </h3>
              <ol className="space-y-3">
                {response.actionPlan.map((action: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-barrels-gold text-black rounded-full flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{action}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Follow-up Prompts */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                Questions You Could Ask Me Next
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.followUpPrompts.map((prompt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setQuestion(prompt)}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-barrels-gold/50 rounded-xl text-sm text-slate-300 hover:text-barrels-gold transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </CoachLayout>
  );
}
