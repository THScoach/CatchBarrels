'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowRight, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PurchaseRequiredClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [returnPath, setReturnPath] = useState<string | null>(null);

  useEffect(() => {
    const path = searchParams?.get('return');
    setReturnPath(path);
  }, [searchParams]);

  const handlePurchase = () => {
    // Save return path for after purchase
    if (returnPath && typeof window !== 'undefined') {
      sessionStorage.setItem('post_purchase_redirect', returnPath);
    }
    
    // Redirect to Whop purchase page
    window.location.href = 'https://whop.com/the-hitting-skool/';
  };

  const tiers = [
    {
      name: 'BARRELS Athlete',
      price: '$49',
      period: '/month',
      icon: '🏏',
      features: [
        'Unlimited video uploads',
        'AI swing analysis',
        'Basic drills library',
        'Progress tracking',
        'Coach Rick AI assistant',
      ],
      popular: false,
    },
    {
      name: 'BARRELS Pro',
      price: '$99',
      period: '/month',
      icon: '💪',
      features: [
        'Everything in Athlete',
        'Advanced biomechanics',
        'Kinematic sequence analysis',
        'Model swing comparison',
        '52-pitch assessments',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'BARRELS Elite',
      price: '$199',
      period: '/month',
      icon: '⚡',
      features: [
        'Everything in Pro',
        'Unlimited assessments',
        'Live coaching sessions',
        'Custom training plans',
        'Direct coach access',
        'Video review priority',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-barrels-black flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-barrels-gold to-barrels-gold-light rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-barrels-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Unlock Your Hitting Potential
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get access to professional-grade swing analysis, AI coaching, and proven training methods.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-barrels-black-light border ${
                tier.popular
                  ? 'border-barrels-gold shadow-lg shadow-barrels-gold/20'
                  : 'border-gray-700'
              } rounded-lg p-6`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{tier.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400 ml-1">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-barrels-gold mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={handlePurchase}
            className="bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold text-lg px-8 py-6 rounded-lg hover:scale-105 transition-transform"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Choose Your Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-gray-500 mt-4 text-sm">
            7-day free trial • Cancel anytime • Secure checkout
          </p>
        </motion.div>

        {/* Return Path Info */}
        {returnPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              After purchase, you'll be redirected to: <span className="text-barrels-gold">{returnPath}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
