'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { isWhopEnvironment, getAndClearRedirectTarget } from '@/lib/whop-utils';

export default function WhopRedirectClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() || {};
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleWhopRedirect = async () => {
      // If already authenticated, check for saved redirect target
      if (status === 'authenticated') {
        const savedTarget = getAndClearRedirectTarget();
        router.push(savedTarget || '/dashboard');
        return;
      }

      // Get the code from URL params (from Whop OAuth callback)
      const code = searchParams?.get('code');
      const error = searchParams?.get('error');
      const callbackUrl = searchParams?.get('callbackUrl');

      if (error) {
        setError(`Authentication error: ${error}`);
        setIsProcessing(false);
        return;
      }

      // Check if we're in Whop environment (App Shell)
      const inWhopEnvironment = isWhopEnvironment();

      if (!code) {
        // No code, initiate Whop OAuth
        try {
          // Use callback URL from params or default to dashboard
          const targetUrl = callbackUrl || '/dashboard';
          await signIn('whop', { callbackUrl: targetUrl });
        } catch (err) {
          console.error('Error initiating Whop sign in:', err);
          setError('Failed to connect to Whop. Please try again.');
          setIsProcessing(false);
        }
        return;
      }

      // Code exists, NextAuth will handle the callback automatically
      // Just wait for session to update
      setIsProcessing(false);
    };

    if (status !== 'loading') {
      handleWhopRedirect();
    }
  }, [status, router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-barrels-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-barrels-black-light border border-barrels-gold/20 rounded-lg p-8 max-w-md w-full text-center"
        >
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-500 text-3xl">⚠️</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connection Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3 px-6 bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-barrels-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Logo */}
        <motion.div
          className="mb-8"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-barrels-gold to-barrels-gold-light rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-barrels-black">B</span>
          </div>
        </motion.div>

        {/* Loading text */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Connecting to CatchBarrels
        </h1>
        <p className="text-gray-400 mb-8">
          {isProcessing
            ? 'Setting up your account...'
            : 'Almost there...'}
        </p>

        {/* Loading spinner */}
        <div className="flex justify-center space-x-2">
          <motion.div
            className="w-3 h-3 bg-barrels-gold rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.div
            className="w-3 h-3 bg-barrels-gold rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="w-3 h-3 bg-barrels-gold rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
