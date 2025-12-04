'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const errorMessages: Record<string, { title: string; description: string; suggestion: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration.',
    suggestion: 'Please contact support if this persists.'
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
    suggestion: 'Please check your account status or contact support.'
  },
  Verification: {
    title: 'Verification Error',
    description: 'The verification token has expired or has already been used.',
    suggestion: 'Please try signing in again.'
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'Error in constructing an authorization URL.',
    suggestion: 'Please try again. If the problem persists, contact support.'
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error handling the OAuth callback from Whop.',
    suggestion: 'This may be due to:\n- Invalid or expired authentication code\n- Mismatched redirect URL\n- Server configuration issue\n\nPlease try logging in again. If this persists, contact support with error code: OAuthCallback'
  },
  OAuthCreateAccount: {
    title: 'OAuth Account Creation Error',
    description: 'Could not create an OAuth provider user account.',
    suggestion: 'Please try again or contact support.'
  },
  EmailCreateAccount: {
    title: 'Email Account Creation Error',
    description: 'Could not create an email provider user account.',
    suggestion: 'Please try again with different credentials.'
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error in the OAuth callback handler route.',
    suggestion: 'Please try signing in again.'
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another account.',
    suggestion: 'Please sign in with your original method.'
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'Sending the verification email failed.',
    suggestion: 'Please check your email address and try again.'
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The credentials you provided are incorrect.',
    suggestion: 'Please check your username and password and try again.'
  },
  default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during sign in.',
    suggestion: 'Please try again. If the problem persists, contact support.'
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get('error') || 'undefined';
  
  // Collect all query parameters for debugging
  const allParams: Record<string, string> = {};
  if (searchParams) {
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
  }
  
  const errorInfo = error && error !== 'undefined' && errorMessages[error] 
    ? errorMessages[error] 
    : errorMessages.default;

  // Log to console for debugging
  console.log('[Auth Error Page] Error code:', error);
  console.log('[Auth Error Page] All query params:', allParams);
  console.log('[Auth Error Page] Full URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');

  const handleRetry = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-barrels-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-barrels-black-light border-red-500/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-white">
                  {errorInfo.title}
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-gray-400">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Suggestion */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {errorInfo.suggestion}
              </p>
            </div>

            {/* Error code for debugging */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 space-y-2">
              <p className="text-xs text-gray-500 font-semibold mb-2">Debug Information:</p>
              <p className="text-xs text-gray-600 font-mono">
                Error Code: <span className={error === 'undefined' ? 'text-red-400' : 'text-yellow-400'}>
                  {error === 'undefined' ? 'undefined (no error code in URL)' : error}
                </span>
              </p>
              {Object.keys(allParams).length > 0 && (
                <div className="pt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Query Parameters:</p>
                  {Object.entries(allParams).map(([key, value]) => (
                    <p key={key} className="text-xs text-gray-600 font-mono">
                      {key}: <span className="text-yellow-400">{value}</span>
                    </p>
                  ))}
                </div>
              )}
              {Object.keys(allParams).length === 0 && (
                <p className="text-xs text-gray-600 italic">No query parameters found in URL</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>

            {/* Support link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <Link href="/support" className="text-barrels-gold hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
