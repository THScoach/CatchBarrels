'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AssessmentRequiredClient() {
  const searchParams = useSearchParams();
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentStatus, setAssessmentStatus] = useState<any>(null);

  useEffect(() => {
    const path = searchParams?.get('return');
    setReturnPath(path);

    // Check current assessment status
    fetchAssessmentStatus();
  }, [searchParams]);

  const fetchAssessmentStatus = async () => {
    try {
      const res = await fetch('/api/player-assessment/status');
      if (res.ok) {
        const data = await res.json();
        setAssessmentStatus(data);
      }
    } catch (error) {
      console.error('Error fetching assessment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1720] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const assessmentSteps = [
    {
      title: 'Profile Setup',
      description: 'Complete your player profile with basic info',
      status: 'complete',
    },
    {
      title: 'Initial Assessment',
      description: assessmentStatus?.hasAssessment 
        ? 'Assessment in progress - pending coach review' 
        : 'Swing identity assessment required',
      status: assessmentStatus?.hasAssessment ? 'in-progress' : 'pending',
    },
    {
      title: 'Coach Verification',
      description: 'Coach Rick reviews and confirms your system',
      status: 'pending',
    },
    {
      title: 'Training Unlocked',
      description: 'Access your personalized training plan',
      status: 'pending',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1720] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#F5A623] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
            <FileCheck className="w-10 h-10 text-[#1a2332]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Assessment Required
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Before you can access training and coaching, we need to assess your swing identity and build your personalized system.
          </p>
        </motion.div>

        {/* Why Assessment Matters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-[#1E293B] border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 text-[#F5A623] mr-3" />
                Why This Matters
              </h2>
              <p className="text-gray-300 mb-4">
                The THS System is built on a simple principle: <strong>Know Your System Before You Train</strong>.
              </p>
              <p className="text-gray-300 mb-4">
                Every hitter has a unique swing identity. Without knowing yours, training becomes guesswork. 
                With it, every drill, every rep, every piece of feedback is laser-focused on YOUR system.
              </p>
              <div className="bg-[#0f1720] border border-[#F5A623]/30 rounded-lg p-4 mt-4">
                <p className="text-[#F5A623] font-semibold">
                  Your assessment will reveal:
                </p>
                <ul className="text-gray-300 mt-2 space-y-2 ml-4">
                  <li>• Your swing identity (Spinner, Whipper, Slingshot, or Titan)</li>
                  <li>• Your constraints (what NOT to chase)</li>
                  <li>• Your training lane (Pods, 1:1, or Remote)</li>
                  <li>• Your personalized coaching system</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assessment Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Assessment Process
          </h2>
          <div className="space-y-4">
            {assessmentSteps.map((step, index) => (
              <Card
                key={index}
                className={`bg-[#1E293B] border ${
                  step.status === 'complete'
                    ? 'border-green-500'
                    : step.status === 'in-progress'
                    ? 'border-[#F5A623]'
                    : 'border-gray-700'
                }`}
              >
                <CardContent className="p-4 flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    step.status === 'complete'
                      ? 'bg-green-500'
                      : step.status === 'in-progress'
                      ? 'bg-[#F5A623]'
                      : 'bg-gray-600'
                  }`}>
                    {step.status === 'complete' ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Card className="bg-[#1E293B] border-[#F5A623]">
            <CardContent className="p-6">
              {assessmentStatus?.hasAssessment ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Assessment In Progress
                  </h3>
                  <p className="text-gray-300">
                    Your assessment is being reviewed by Coach Rick. You'll be notified when it's complete and you can access your training.
                  </p>
                  <p className="text-gray-400 text-sm mt-4">
                    Current status: <span className="text-[#F5A623] font-semibold">{assessmentStatus.assessment?.status?.replace(/_/g, ' ').toUpperCase()}</span>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Contact Coach Rick
                  </h3>
                  <p className="text-gray-300 mb-4">
                    To schedule your assessment, please contact Coach Rick directly. He'll guide you through the process and get you set up.
                  </p>
                  <div className="bg-[#0f1720] rounded-lg p-4 inline-block">
                    <p className="text-[#F5A623] font-semibold">
                      📧 coach@thehittingskool.com
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Return Path Info */}
        {returnPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-400 text-sm">
              After assessment completion, you'll be redirected to: <span className="text-[#F5A623]">{returnPath}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
