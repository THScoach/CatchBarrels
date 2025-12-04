'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GoatyFeedbackBlockProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  hasPreviousSwing?: boolean;
  isVisible?: boolean; // Control visibility via toggle
}

export function GoatyFeedbackBlock({ 
  messages, 
  onSendMessage, 
  hasPreviousSwing = false,
  isVisible = true 
}: GoatyFeedbackBlockProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast.success('Voice captured! Review and tap Send Text.');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recording failed. Please try again or use text.');
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isVisible) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isVisible]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleVoiceRecord = () => {
    if (!recognition) {
      toast.error('Voice recording not supported in this browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
        toast.info('Listening... Speak now!');
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast.error('Could not start voice recording');
      }
    }
  };

  const quickPrompts = [
    {
      label: 'Main thing to fix',
      fullPrompt: `Based on this swing and the metrics you see (Anchor, Engine, Whip, motion, stability, sequencing), what is the single most important thing I need to fix?
Keep the answer short, plain language, and give one clear priority for my next rep.`
    },
    {
      label: 'Explain my head movement',
      fullPrompt: `Explain my head movement in this swing.

How much am I moving compared to what you'd consider stable?
When in the swing does it move the most?
Why does that matter for my contact and consistency?
Use simple language and 2–3 sentences.`
    },
    {
      label: 'Give me one drill',
      fullPrompt: `Given this swing's scores and motion (Anchor, Engine, Whip, motion/stability/sequencing), recommend one drill that best addresses my biggest problem.
Include:

The drill name
What it fixes
How to do it in 3–4 simple steps.`
    },
    {
      label: 'What should I feel next rep?',
      fullPrompt: `For my very next rep, tell me exactly what I should focus on or feel.
Base it on this swing's main flaw.
Use 1–2 short cues I can remember in the box (for example: 'feel your weight stay inside your feet' or 'feel your hands stay back longer').`
    }
  ];

  // Conditionally add "Compare to last swing" if previous swing exists
  if (hasPreviousSwing) {
    quickPrompts.push({
      label: 'Compare to last swing',
      fullPrompt: `Compare this swing to my previous swing in this same session.

What got better?
What stayed the same?
What got worse?
Keep it to 3 bullet points: better / same / worse.`
    });
  }

  const handleQuickPrompt = (fullPrompt: string) => {
    setInput(fullPrompt);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 p-4">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">
              Ask Coach
            </h3>
            <p className="text-sm text-gray-400">
              Get direct feedback on your swing
            </p>
          </div>

          {/* Response area - only show if there are messages */}
          {messages.length > 0 && (
            <div className="mb-4 max-h-[300px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-orange-500/20 border border-orange-500/30 ml-8'
                      : 'bg-gray-700/50 border border-gray-600 mr-8'
                  }`}
                >
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Quick Action Chips */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-orange-500/20 border-orange-500/30 text-orange-300 text-xs px-2 py-1"
                  onClick={() => handleQuickPrompt(prompt.fullPrompt)}
                >
                  {prompt.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Multiline Text Input */}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or instructions for Coach about this swing or drill…"
            className="mb-3 min-h-[80px] bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 resize-none"
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Text
            </Button>
            <Button
              onClick={handleVoiceRecord}
              variant="outline"
              className={`flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 ${
                isRecording ? 'bg-red-500/20 border-red-500/50 text-red-300' : ''
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2 animate-pulse" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Record Voice
                </>
              )}
            </Button>
          </div>

          {isRecording && (
            <p className="text-xs text-red-300 mt-2 text-center animate-pulse">
              🎙️ Listening... Speak now!
            </p>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
