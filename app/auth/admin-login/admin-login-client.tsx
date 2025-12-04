'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminLoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: 'coach@catchbarrels.app',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get callback URL from query params
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get('callbackUrl') || '/admin';

      const result = await signIn('admin-credentials', {
        email: formData.username,  // admin-credentials provider uses 'email' field
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Invalid admin credentials or insufficient permissions');
        toast.error('Access denied', {
          description: 'Only administrators and coaches can access this area.',
        });
      } else if (result?.ok) {
        toast.success('Admin access granted', {
          description: 'Redirecting to Coach Home...',
        });
        // Redirect to admin dashboard (NO router.refresh())
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Login failed', {
        description: 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Regular Login */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to regular login
        </Link>

        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">
              <span className="text-[#F5A623]">BARRELS</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Admin Access</p>
        </div>

        {/* Admin Login Card */}
        <Card className="bg-gray-800/50 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Admin Sign In
            </CardTitle>
            <CardDescription className="text-gray-400">
              Restricted access for administrators and coaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username/Email */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Admin Email
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="coach@catchbarrels.app"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={loading}
                  className="bg-gray-900/50 border-gray-600 text-white"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  className="bg-gray-900/50 border-gray-600 text-white"
                  required
                  autoFocus
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In as Admin
                  </>
                )}
              </Button>
            </form>

            {/* Admin Info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-blue-300">Production Admin Credentials</p>
                    <p className="text-xs text-gray-400">
                      Email: <span className="text-blue-300">coach@catchbarrels.app</span><br />
                      Password: <span className="text-blue-300">CoachBarrels2024!</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Secure admin access for CatchBarrels coaching team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Secure admin access • All actions are logged</p>
        </div>
      </div>
    </div>
  );
}
