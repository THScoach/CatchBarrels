'use client';

import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CoachRickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    pageType?: 'dashboard' | 'video' | 'lesson' | 'drill' | 'session';
    videoId?: string;
    lessonId?: string;
    drillId?: string;
    sessionId?: string;
  };
}

export function CoachRickDrawer({ isOpen, onClose, context }: CoachRickDrawerProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/coach-rick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: context || {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Coach Rick');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'Sorry, I couldn\'t process that. Please try again.',
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to reach Coach Rick. Please try again.');
    } finally {
      setIsSending(false);
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

  // Quick prompts based on context
  const getQuickPrompts = () => {
    const basePrompts = [
      {
        label: 'Main thing to fix',
        fullPrompt: 'Based on what you see, what is the single most important thing I need to fix? Keep it short and give one clear priority.'
      },
      {
        label: 'Explain my mechanics',
        fullPrompt: 'Explain my mechanics in simple language. What am I doing well and what needs work?'
      },
      {
        label: 'Give me one drill',
        fullPrompt: 'Recommend one drill that best addresses my biggest problem. Include the drill name, what it fixes, and how to do it.'
      },
      {
        label: 'What should I feel?',
        fullPrompt: 'For my next rep, tell me exactly what I should focus on or feel. Give me 1-2 short cues I can remember.'
      }
    ];

    return basePrompts;
  };

  const handleQuickPrompt = (fullPrompt: string) => {
    setInput(fullPrompt);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-gradient-to-b from-gray-900 via-gray-900 to-black border-l border-gray-700">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-white">
            Ask Coach Rick
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Get direct feedback and coaching advice
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-120px)] mt-6">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
            {messages.length === 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  👋 Hey! I'm Coach Rick. Ask me anything about your swing, mechanics, or how to improve.
                </p>
              </div>
            )}
            
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

          {/* Quick Actions */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {getQuickPrompts().map((prompt, idx) => (
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

          {/* Input Area */}
          <div className="space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              className="min-h-[80px] bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Text
                  </>
                )}
              </Button>
              <Button
                onClick={handleVoiceRecord}
                variant="outline"
                disabled={isSending}
                className={`flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 ${
                  isRecording ? 'bg-red-500/20 border-red-500/50 text-red-300' : ''
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2 animate-pulse" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Voice
                  </>
                )}
              </Button>
            </div>

            {isRecording && (
              <p className="text-xs text-red-300 text-center animate-pulse">
                🎙️ Listening... Speak now!
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
