'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Ruler, Weight, Hand, Calendar } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (data: ProfileData) => void;
  isLoading: boolean;
}

interface ProfileData {
  height: number;
  weight: number;
  bats: string;
  level: string;
}

export function ProfileSetup({ onComplete, isLoading }: ProfileSetupProps) {
  const [formData, setFormData] = useState<ProfileData>({
    height: 0,
    weight: 0,
    bats: '',
    level: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.height || formData.height < 40 || formData.height > 90) {
      newErrors.height = 'Please enter a valid height (40-90 inches)';
    }

    if (!formData.weight || formData.weight < 50 || formData.weight > 500) {
      newErrors.weight = 'Please enter a valid weight (50-500 lbs)';
    }

    if (!formData.bats) {
      newErrors.bats = 'Please select your dominant hand';
    }

    if (!formData.level) {
      newErrors.level = 'Please select your age group';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(formData);
    }
  };

  return (
    <div className="space-y-6 px-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Let's Get to Know You</h2>
        <p className="text-gray-400">
          This helps Coach Rick AI calibrate your Momentum Transfer Score accurately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height" className="flex items-center gap-2 text-gray-300">
            <Ruler className="w-4 h-4 text-barrels-gold" />
            Height (inches)
          </Label>
          <Input
            id="height"
            type="number"
            placeholder="e.g., 72"
            value={formData.height || ''}
            onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
            className="bg-gray-800 border-gray-700 text-white"
            disabled={isLoading}
          />
          {errors.height && (
            <p className="text-sm text-red-400">{errors.height}</p>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight" className="flex items-center gap-2 text-gray-300">
            <Weight className="w-4 h-4 text-barrels-gold" />
            Weight (lbs)
          </Label>
          <Input
            id="weight"
            type="number"
            placeholder="e.g., 180"
            value={formData.weight || ''}
            onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
            className="bg-gray-800 border-gray-700 text-white"
            disabled={isLoading}
          />
          {errors.weight && (
            <p className="text-sm text-red-400">{errors.weight}</p>
          )}
        </div>

        {/* Dominant Hand */}
        <div className="space-y-2">
          <Label htmlFor="bats" className="flex items-center gap-2 text-gray-300">
            <Hand className="w-4 h-4 text-barrels-gold" />
            Dominant Hand (Bats)
          </Label>
          <Select
            value={formData.bats}
            onValueChange={(value) => setFormData({ ...formData, bats: value })}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select hand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Right">Right</SelectItem>
              <SelectItem value="Left">Left</SelectItem>
              <SelectItem value="Switch">Switch</SelectItem>
            </SelectContent>
          </Select>
          {errors.bats && (
            <p className="text-sm text-red-400">{errors.bats}</p>
          )}
        </div>

        {/* Age Group / Level */}
        <div className="space-y-2">
          <Label htmlFor="level" className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-barrels-gold" />
            Age Group / Level
          </Label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData({ ...formData, level: value })}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Youth (8-12)">Youth (8-12)</SelectItem>
              <SelectItem value="High School (13-18)">High School (13-18)</SelectItem>
              <SelectItem value="College (18-23)">College (18-23)</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Adult Rec">Adult Rec</SelectItem>
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-sm text-red-400">{errors.level}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:from-barrels-gold-light hover:to-barrels-gold text-black font-bold py-3 text-lg"
          >
            {isLoading ? 'Saving...' : 'Continue to Next Step'}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onComplete(formData)}
            className="text-sm text-gray-500 hover:text-gray-400 underline"
            disabled={isLoading}
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
