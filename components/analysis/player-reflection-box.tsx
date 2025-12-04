'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PlayerReflectionBoxProps {
  value: string;
  onChange: (text: string) => void;
}

export function PlayerReflectionBox({ value, onChange }: PlayerReflectionBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 p-4">
        <Label htmlFor="reflection" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          What did you feel? What worked or didn't work?
        </Label>
        <Textarea
          id="reflection"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: 'Felt like I was rotating my hips better, but still flipping at impact...'"
          className="min-h-[100px] bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 resize-none"
        />
      </Card>
    </motion.div>
  );
}
