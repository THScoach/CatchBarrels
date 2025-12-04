
'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  showHomeButton?: boolean;
  variant?: 'error' | 'warning' | 'network';
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  error,
  onRetry,
  showHomeButton = false,
  variant = 'error',
}: ErrorStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'network':
        return {
          gradient: 'from-orange-500/20 to-orange-600/20',
          iconBg: 'bg-orange-500/10',
          iconColor: 'text-orange-400',
          borderColor: 'border-orange-500/20',
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500/20 to-yellow-600/20',
          iconBg: 'bg-yellow-500/10',
          iconColor: 'text-yellow-400',
          borderColor: 'border-yellow-500/20',
        };
      default:
        return {
          gradient: 'from-red-500/20 to-red-600/20',
          iconBg: 'bg-red-500/10',
          iconColor: 'text-red-400',
          borderColor: 'border-red-500/20',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon with gradient background */}
        <div className="flex justify-center">
          <div
            className={`relative p-6 rounded-full ${styles.iconBg} border ${styles.borderColor}`}
          >
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.gradient} opacity-50 animate-pulse`}
            />
            <AlertCircle className={`w-12 h-12 ${styles.iconColor} relative z-10`} />
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{message}</p>
          
          {/* Show technical error details in development */}
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-gray-800/50 rounded text-xs text-red-400 overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-[#F5A623] hover:bg-[#E89815] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {showHomeButton && (
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized error state variants
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Lost"
      message="Unable to reach the server. Please check your internet connection and try again."
      variant="network"
      onRetry={onRetry}
    />
  );
}

export function UploadErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Upload Failed"
      message="We couldn't upload your video. This might be due to file size, format, or network issues. Please try again."
      variant="error"
      onRetry={onRetry}
      showHomeButton={true}
    />
  );
}

export function VideoLoadErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Video Unavailable"
      message="We couldn't load this video. It might have been moved or deleted. Try refreshing the page."
      variant="warning"
      onRetry={onRetry}
      showHomeButton={true}
    />
  );
}

export function AnalysisErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Analysis Failed"
      message="We couldn't complete the swing analysis. This is usually temporary. Please try uploading again."
      variant="error"
      onRetry={onRetry}
      showHomeButton={true}
    />
  );
}

export function CoachRickErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Coach Rick is Unavailable"
      message="We're having trouble connecting to Coach Rick. Please try your question again in a moment."
      variant="warning"
      onRetry={onRetry}
    />
  );
}
