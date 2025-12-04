'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Target, FileText, Play, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LessonNewClientProps {
  activeLesson: any;
  user: any;
}

export default function LessonNewClient({ activeLesson, user }: LessonNewClientProps) {
  const router = useRouter();
  const [goal, setGoal] = useState(activeLesson?.goal || '');
  const [notes, setNotes] = useState(activeLesson?.notes || '');
  const [isCreating, setIsCreating] = useState(false);

  const handleStartLesson = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, notes }),
      });

      if (!response.ok) throw new Error('Failed to create lesson');

      const lesson = await response.json();
      toast.success('Lesson started! Upload your first swing.');
      router.refresh();
    } catch (error) {
      console.error('Error starting lesson:', error);
      toast.error('Failed to start lesson');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEndLesson = async () => {
    if (!activeLesson) return;

    try {
      const response = await fetch(`/api/lessons/${activeLesson.id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to complete lesson');

      toast.success('Lesson saved! Check it out in History.');
      router.push('/lesson/history');
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to complete lesson');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="p-4 space-y-6 max-w-4xl mx-auto mt-6">
        {!activeLesson ? (
          // Initial State - No Active Lesson
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">Start a New Lesson</h2>
              <p className="text-gray-400 mb-6">
                Set your focus and let's work on your swing!
              </p>
            </motion.div>

            {/* Goal Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 p-6">
                <label className="block text-white font-semibold mb-3">
                  <Target className="inline h-5 w-5 mr-2 text-barrels-gold" />
                  Lesson Goal (Optional)
                </label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Select a goal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timing">Timing</SelectItem>
                    <SelectItem value="anchor-stability">Anchor Stability</SelectItem>
                    <SelectItem value="engine-sequencing">Engine Sequencing</SelectItem>
                    <SelectItem value="whip-direction">Whip Direction</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 p-6">
                <label className="block text-white font-semibold mb-3">
                  <FileText className="inline h-5 w-5 mr-2 text-barrels-gold" />
                  Lesson Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What are you working on today? Any specific feels or drills you want to try?"
                  className="bg-gray-900 border-gray-700 text-white min-h-[120px]"
                />
              </Card>
            </motion.div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Button
                size="lg"
                onClick={handleStartLesson}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:from-barrels-gold-light hover:to-barrels-gold text-barrels-black font-bold text-lg h-16"
              >
                <Play className="mr-2 h-6 w-6" />
                {isCreating ? 'Starting...' : 'Start Lesson!'}
              </Button>
            </motion.div>
          </>
        ) : (
          // Active Lesson State
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Active Lesson</h2>
                  {activeLesson.goal && (
                    <p className="text-barrels-gold font-semibold">
                      Focus: {activeLesson.goal.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{activeLesson.swingCount}</p>
                  <p className="text-gray-400 text-sm">Swings</p>
                </div>
              </div>
            </motion.div>

            {/* Upload Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 p-8 text-center">
                <Upload className="h-16 w-16 mx-auto mb-4 text-barrels-gold" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {activeLesson.swingCount === 0 ? 'Upload your first swing' : 'Add another swing'}
                </h3>
                <p className="text-gray-400 mb-6">
                  Each swing will be analyzed and added to this lesson
                </p>
                <Button
                  size="lg"
                  onClick={() => router.push(`/video/upload?lessonId=${activeLesson.id}`)}
                  className="bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:from-barrels-gold-light hover:to-barrels-gold text-barrels-black font-bold"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Video
                </Button>
              </Card>
            </motion.div>

            {/* Lesson Metrics (if swings exist) */}
            {activeLesson.swingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Lesson Averages</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-barrels-gold/20 to-barrels-gold-light/10 border-barrels-gold/40 p-4">
                    <p className="text-gray-300 text-sm mb-1">BARREL</p>
                    <p className="text-4xl font-bold text-white">
                      {activeLesson.lessonBarrelScore?.toFixed(0) || '—'}
                    </p>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/40 p-4">
                    <p className="text-gray-300 text-sm mb-1">Anchor</p>
                    <p className="text-4xl font-bold text-white">
                      {activeLesson.lessonAnchorScore?.toFixed(0) || '—'}
                    </p>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/40 p-4">
                    <p className="text-gray-300 text-sm mb-1">Engine</p>
                    <p className="text-4xl font-bold text-white">
                      {activeLesson.lessonEngineScore?.toFixed(0) || '—'}
                    </p>
                  </Card>
                  <Card className="bg-gradient-to-br from-barrels-gold/20 to-barrels-gold-light/10 border-barrels-gold/40 p-4">
                    <p className="text-gray-300 text-sm mb-1">Whip</p>
                    <p className="text-4xl font-bold text-white">
                      {activeLesson.lessonWhipScore?.toFixed(0) || '—'}
                    </p>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* End Lesson Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-4"
            >
              <Button
                size="lg"
                variant="outline"
                onClick={handleEndLesson}
                className="w-full bg-gray-800/50 border-gray-600 hover:border-barrels-gold/50 hover:bg-gray-800 text-white font-bold text-lg h-14"
              >
                <FileText className="mr-2 h-5 w-5" />
                End Lesson & Save
              </Button>
            </motion.div>
          </>
        )}
      </div>

    </div>
  );
}
