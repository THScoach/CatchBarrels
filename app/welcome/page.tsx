
'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// PHASE 1: Simple auto-authentication simulating Whop entry
// PHASE 5: Will be replaced with actual Whop OAuth flow

export default function WelcomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'authenticating' | 'redirecting'>('authenticating');

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        // In Phase 1, we auto-sign in the test user to simulate Whop authentication
        // In Phase 5, this will verify the Whop token and create/fetch user
        const result = await signIn('credentials', {
          username: 'john@doe.com',
          password: 'johndoe123',
          redirect: false,
        });

        if (result?.ok) {
          setStatus('redirecting');
          // Small delay for smoother UX
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
        } else {
          // In case of error, show a message
          console.error('Authentication failed');
          setStatus('redirecting');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    authenticateUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1621] flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* BARRELS Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="text-[#F5A623]">BARRELS</span>
          </h1>
          <p className="text-gray-400 text-lg">Baseball Training</p>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#F5A623] animate-spin" />
          <p className="text-white text-lg">
            {status === 'authenticating' ? 'Verifying access...' : 'Loading your dashboard...'}
          </p>
          <p className="text-gray-500 text-sm max-w-md">
            {status === 'authenticating' 
              ? 'Connecting with Whop platform...'
              : 'Get ready to improve your swing!'}
          </p>
        </div>

        {/* Phase Info (dev only) */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-gray-600 text-xs">
            Phase 1: Prototype Mode<br />
            Whop OAuth integration coming in Phase 5
          </p>
        </div>
      </div>
    </div>
  );
}
