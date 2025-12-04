
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CoachRickChatProps {
  userScores?: {
    anchor?: number;
    engine?: number;
    whip?: number;
    exitVelocity?: number;
    overallScore?: number;
  };
  coachingCallId?: string;
  coachingCallTitle?: string;
}

export default function CoachRickChat({ userScores, coachingCallId, coachingCallTitle }: CoachRickChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initial message changes based on context
  const initialMessage = coachingCallId 
    ? `Hey! I'm Coach Rick! 👋 I've got the transcript from "${coachingCallTitle}" ready. Ask me anything about what we discussed! ⚾`
    : "Hey! I'm Coach Rick! 👋 Ask me anything about your swing, the 4Bs system, or how to improve! ⚾";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context based on current page and user data
  const getContext = () => {
    const context: any = {
      currentPage: pathname,
      userScores: userScores || null,
    };

    // Add page-specific context
    if (pathname?.includes('/dashboard')) {
      context.pageContext = 'User is viewing their dashboard with overall stats';
    } else if (pathname?.includes('/video')) {
      context.pageContext = 'User is viewing their swing videos';
    } else if (pathname?.includes('/drills')) {
      context.pageContext = 'User is browsing the drill library';
    } else if (pathname?.includes('/progress')) {
      context.pageContext = 'User is viewing their progress tracking';
    }

    return context;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/coach-rick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          context: getContext(),
          coachingCallId: coachingCallId || null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Determine error type and show appropriate message
      let errorContent = "Sorry, I'm having trouble connecting right now. Please check your internet and try again! 🔧";
      
      if (error instanceof Error && error.name === 'AbortError') {
        errorContent = "That took too long to process. Try asking something simpler or try again! ⏱️";
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorContent = "Can't reach the server right now. Check your connection and try again! 📡";
      } else if (error instanceof Error && error.message.includes('Server error: 5')) {
        errorContent = "The AI is temporarily unavailable. Please try again in a moment! 🤖";
      } else if (error instanceof Error && error.message.includes('Server error: 429')) {
        errorContent = "Too many requests! Please wait a moment before asking again. ⏸️";
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick question suggestions (context-aware)
  const quickQuestions = coachingCallId 
    ? [
        "What were the main topics covered?",
        "What drills were recommended?",
        "Can you summarize the key advice?",
        "What should I focus on from this call?",
      ]
    : [
        "What's the 4Bs system?",
        "How do I improve my Anchor score?",
        "What does Exit Velocity mean?",
        "Which drills should I do?",
      ];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
              Ask Coach Rick
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-96 h-[600px] bg-[#1a2332] border border-gray-700 rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                  ⚾
                </div>
                <div>
                  <h3 className="text-white font-semibold">Coach Rick</h3>
                  <p className="text-orange-100 text-xs">Always here to help!</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-orange-800 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                  </div>
                </div>
              )}

              {/* Quick questions (show only if no messages yet) */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-xs">Quick questions:</p>
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputMessage(q);
                        setTimeout(handleSendMessage, 100);
                      }}
                      className="block w-full text-left text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Coach Rick anything..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-orange-600 text-white rounded-lg p-2 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
