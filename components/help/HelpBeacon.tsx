'use client';

import { useState } from 'react';
import { HelpCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpPageId, getPageHelpConfigById } from '@/lib/help/pageHelpConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HelpBeaconProps {
  pageId: HelpPageId;
  contextData?: Record<string, any>; // optional extra data (scores, flags, etc.)
  variant?: 'icon' | 'button';       // default 'icon'
}

export function HelpBeacon({ pageId, contextData = {}, variant = 'icon' }: HelpBeaconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const config = getPageHelpConfigById(pageId);

  if (!config) {
    console.error(`No help config found for pageId: ${pageId}`);
    return null;
  }

  const handleAskCoachRick = async (question?: string) => {
    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await fetch('/api/help/page-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          userQuestion: question || 'Help me understand this page',
          contextData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get help from Coach Rick');
      }

      const data = await response.json();

      if (data.ok) {
        setAiResponse(data.answer);
        setSelectedQuestion(question || null);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Help request error:', err);
      setError('Failed to connect to Coach Rick. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render trigger button/icon
  const renderTrigger = () => {
    if (variant === 'button') {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Need help?</span>
        </button>
      );
    }

    // Default: floating icon
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Help Drawer/Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer/Modal */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-barrels-black-light border-l border-gray-800 z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-barrels-black-light border-b border-gray-800 p-6 z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-barrels-gold" />
                    <span className="text-xs font-medium text-barrels-gold">Coach Rick Help</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-white">{config.title}</h2>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Page Description */}
                <div className="bg-barrels-black rounded-lg p-4 border border-gray-800">
                  <p className="text-sm text-gray-300 leading-relaxed">{config.shortDescription}</p>
                </div>

                {/* Common Questions */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Common Questions</h3>
                  <div className="flex flex-wrap gap-2">
                    {config.keyQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleAskCoachRick(question)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <HelpCircle className="w-3 h-3" />
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">What You Can Do Here</h3>
                  <ul className="space-y-2">
                    {config.keyActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-barrels-gold mt-0.5">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ask Coach Rick Button */}
                {!aiResponse && (
                  <Button
                    onClick={() => handleAskCoachRick()}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold hover:opacity-90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Coach Rick is thinking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Ask Coach Rick about this page
                      </>
                    )}
                  </Button>
                )}

                {/* AI Response */}
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="bg-barrels-gold/20 text-barrels-gold border-barrels-gold/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Coach Rick's Answer
                      </Badge>
                    </div>

                    {selectedQuestion && (
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Your question:</p>
                        <p className="text-sm text-white">{selectedQuestion}</p>
                      </div>
                    )}

                    <div className="bg-barrels-black rounded-lg p-4 border border-gray-800 max-h-[400px] overflow-y-auto">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {aiResponse}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setAiResponse(null);
                        setSelectedQuestion(null);
                      }}
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Ask Another Question
                    </Button>
                  </motion.div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                    <p className="text-sm text-red-400">{error}</p>
                    <Button
                      onClick={() => handleAskCoachRick()}
                      variant="outline"
                      className="w-full mt-3 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
