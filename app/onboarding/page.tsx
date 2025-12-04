
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const steps = [
  { id: 'welcome', title: 'Welcome to BARRELS!' },
  { id: 'basic', title: 'Basic Information' },
  { id: 'physical', title: 'Physical Stats' },
  { id: 'playing', title: 'Playing Profile' },
  { id: 'level', title: 'Experience Level' },
  { id: 'equipment', title: 'Your Equipment' },
  { id: 'struggles', title: 'Current Challenges' },
  { id: 'goals', title: 'Your Goals' },
  { id: 'mental', title: 'Mental Approach' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    bats: '',
    throws: '',
    position: '',
    level: '',
    batLength: '',
    batWeight: '',
    batType: '',
    struggles: [] as string[],
    goals: [] as string[],
    mentalApproach: '',
    confidenceLevel: 5,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'struggles' | 'goals', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Use replace instead of push to avoid back button issues
        router.replace('/dashboard');
      } else {
        // Show error if response is not ok
        console.error('Profile update failed with status:', response.status);
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step?.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">⚾</div>
            <h2 className="text-3xl font-bold text-white">Welcome to BARRELS!</h2>
            <p className="text-gray-400 text-lg">
              Let's set up your profile to get personalized swing analysis and training recommendations.
            </p>
            <p className="text-sm text-gray-500">This will only take a few minutes</p>
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData?.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData?.dateOfBirth || ''}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        );

      case 'physical':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Physical Stats</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Height (inches)</label>
              <input
                type="number"
                value={formData?.height || ''}
                onChange={(e) => updateField('height', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="e.g., 70 (5'10'')"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Height helps us calculate optimal stride length</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Weight (lbs)</label>
              <input
                type="number"
                value={formData?.weight || ''}
                onChange={(e) => updateField('weight', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="e.g., 175"
              />
            </div>
          </div>
        );

      case 'playing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Playing Profile</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Bats</label>
              <div className="grid grid-cols-3 gap-3">
                {['Right', 'Left', 'Switch'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('bats', option)}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData?.bats === option
                        ? 'border-[#F5A623] bg-[#F5A623]/20 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Throws</label>
              <div className="grid grid-cols-2 gap-3">
                {['Right', 'Left'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('throws', option)}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData?.throws === option
                        ? 'border-[#F5A623] bg-[#F5A623]/20 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Position</label>
              <select
                value={formData?.position || ''}
                onChange={(e) => updateField('position', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="">Select position</option>
                <option value="Pitcher">Pitcher</option>
                <option value="Catcher">Catcher</option>
                <option value="First Base">First Base</option>
                <option value="Second Base">Second Base</option>
                <option value="Third Base">Third Base</option>
                <option value="Shortstop">Shortstop</option>
                <option value="Left Field">Left Field</option>
                <option value="Center Field">Center Field</option>
                <option value="Right Field">Right Field</option>
              </select>
            </div>
          </div>
        );

      case 'level':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Experience Level</h2>
            <div className="space-y-3">
              {[
                'Youth (8-12)',
                'High School (13-18)',
                'College',
                'Pro/Minor League',
                'Adult Rec',
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateField('level', option)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                    formData?.level === option
                      ? 'border-[#F5A623] bg-[#F5A623]/20 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Equipment</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bat Length (inches)</label>
              <input
                type="number"
                value={formData?.batLength || ''}
                onChange={(e) => updateField('batLength', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="e.g., 33"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bat Weight (oz)</label>
              <input
                type="number"
                value={formData?.batWeight || ''}
                onChange={(e) => updateField('batWeight', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bat Type</label>
              <select
                value={formData?.batType || ''}
                onChange={(e) => updateField('batType', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="">Select bat type</option>
                <option value="BBCOR">BBCOR</option>
                <option value="USSSA">USSSA</option>
                <option value="USA">USA Baseball</option>
                <option value="Wood">Wood</option>
                <option value="Senior League">Senior League</option>
              </select>
            </div>
          </div>
        );

      case 'struggles':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What are you struggling with?</h2>
            <p className="text-gray-400">Select all that apply</p>
            <div className="space-y-2">
              {[
                'Getting jammed on inside pitches',
                'Chasing high fastballs',
                'Rolling over for ground balls',
                'Weak contact',
                'Inconsistent timing',
                'Balance issues',
                'Slow bat speed',
                "Can't hit breaking balls",
              ].map((struggle) => (
                <button
                  key={struggle}
                  type="button"
                  onClick={() => toggleArrayField('struggles', struggle)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                    formData?.struggles?.includes(struggle)
                      ? 'border-[#F5A623] bg-[#F5A623]/20 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        formData?.struggles?.includes(struggle)
                          ? 'border-[#F5A623] bg-[#F5A623]'
                          : 'border-gray-600'
                      }`}
                    >
                      {formData?.struggles?.includes(struggle) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {struggle}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              💡 This helps us recommend the right drills for you
            </p>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What are your hitting goals?</h2>
            <p className="text-gray-400">Select your top 3</p>
            <div className="space-y-2">
              {[
                'Hit for more power',
                'Hit for higher average',
                'Better plate discipline',
                'Hit all fields',
                'Faster bat speed',
                'More consistent contact',
                'Hit breaking balls better',
                'Reduce strikeouts',
              ].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleArrayField('goals', goal)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                    formData?.goals?.includes(goal)
                      ? 'border-[#F5A623] bg-[#F5A623]/20 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                  disabled={!formData?.goals?.includes(goal) && formData?.goals?.length >= 3}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        formData?.goals?.includes(goal)
                          ? 'border-[#F5A623] bg-[#F5A623]'
                          : 'border-gray-600'
                      }`}
                    >
                      {formData?.goals?.includes(goal) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {goal}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'mental':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Mental Approach</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                How would you describe your approach at the plate?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'Aggressive', desc: 'I swing early in counts' },
                  { value: 'Selective', desc: 'I take a lot of pitches' },
                  { value: 'Balanced', desc: 'Depends on the count' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('mentalApproach', option.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                      formData?.mentalApproach === option.value
                        ? 'border-[#F5A623] bg-[#F5A623]/20 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium">{option.value}</div>
                    <div className="text-sm text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confidence Level: {formData?.confidenceLevel || 5}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData?.confidenceLevel || 5}
                onChange={(e) => updateField('confidenceLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#F5A623]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4 pb-24">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-[#F5A623] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-[#F5A623] hover:bg-[#E89815] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : currentStep === steps.length - 1 ? (
              'Finish'
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
