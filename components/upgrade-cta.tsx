'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MembershipTier } from '@/lib/tier-access';

interface UpgradeCTAProps {
  tier: MembershipTier;
  title?: string;
  message?: string;
  feature?: string;
}

export default function UpgradeCTA({
  tier,
  title = 'Upgrade Required',
  message,
  feature,
}: UpgradeCTAProps) {
  const router = useRouter();

  const tierInfo: Record<MembershipTier, { price: string; features: string[] }> = {
    free: { price: '$0', features: [] },
    athlete: {
      price: '$49/mo',
      features: [
        'Unlimited video uploads',
        'Basic drills & exercises',
        'Progress tracking',
        'Coach Rick AI assistance',
      ],
    },
    pro: {
      price: '$99/mo',
      features: [
        'Everything in Athlete',
        'Advanced biomechanics',
        'Kinematic sequence analysis',
        'Model swing comparison',
        '52-pitch assessments',
      ],
    },
    elite: {
      price: '$199/mo',
      features: [
        'Everything in Pro',
        'Unlimited assessments',
        'Priority support',
        'Custom training plans',
        'Live coaching access',
      ],
    },
  };

  const handleUpgrade = () => {
    // Redirect to Whop purchase page or pricing page
    window.open('https://whop.com/barrels', '_blank');
  };

  return (
    <div className="min-h-screen bg-barrels-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-barrels-black-light border border-barrels-gold/20 rounded-lg p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-barrels-gold to-barrels-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">
            {message || `Upgrade to ${tierInfo[tier].price} to unlock this feature`}
          </p>
        </div>

        {/* Feature list */}
        <div className="bg-barrels-black rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            What you'll get:
          </h3>
          <ul className="space-y-3">
            {tierInfo[tier].features.map((feature, index) => (
              <li key={index} className="flex items-start text-gray-300">
                <span className="text-barrels-gold mr-3 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUpgrade}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Upgrade Now - {tierInfo[tier].price}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 py-4 px-6 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-gray-500 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>✓ Cancel anytime • ✓ 7-day free trial • ✓ Secure checkout</p>
        </div>
      </motion.div>
    </div>
  );
}
