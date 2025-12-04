'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginClient() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<'athlete' | 'admin'>('athlete');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get callback URL from query params
      const searchParams = new URLSearchParams(window.location.search);
      const defaultCallback = loginMode === 'admin' ? '/admin' : '/dashboard';
      const callbackUrl = searchParams.get('callbackUrl') || defaultCallback;

      // Use appropriate provider based on mode
      const provider = loginMode === 'admin' ? 'admin-credentials' : 'credentials';
      const credentials = loginMode === 'admin' 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, password: formData.password };

      const result = await signIn(provider, {
        ...credentials,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        const errorMsg = loginMode === 'admin' 
          ? 'Invalid admin credentials or insufficient permissions'
          : 'Invalid username or password';
        setError(errorMsg);
        toast.error('Login failed', {
          description: errorMsg,
        });
      } else if (result?.ok) {
        const welcomeMsg = loginMode === 'admin' ? 'Welcome, Admin!' : 'Welcome back!';
        toast.success(welcomeMsg, {
          description: 'Redirecting...',
        });
        
        // Navigate to callback URL (admin users go to /admin, others to dashboard)
        const redirectUrl = loginMode === 'admin' ? '/admin' : callbackUrl;
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Login failed', {
        description: 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, password: string, isAdmin: boolean = false) => {
    if (isAdmin) {
      setFormData({ username: '', email, password });
      setLoginMode('admin');
    } else {
      setFormData({ username: email, email: '', password });
      setLoginMode('athlete');
    }
    setError('');
    setLoading(true);

    try {
      // Get callback URL from query params
      const searchParams = new URLSearchParams(window.location.search);
      const defaultCallback = isAdmin ? '/admin' : '/dashboard';
      const callbackUrl = searchParams.get('callbackUrl') || defaultCallback;

      const provider = isAdmin ? 'admin-credentials' : 'credentials';
      const credentials = isAdmin 
        ? { email, password }
        : { username: email, password };

      const result = await signIn(provider, {
        ...credentials,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Login failed');
        toast.error('Login failed');
      } else if (result?.ok) {
        toast.success('Welcome!');
        // Navigate to callback URL (no router.refresh() needed with NextAuth)
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Image
              src="/branding/logo-primary-dark.png"
              alt="CatchBarrels"
              width={280}
              height={70}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-xl text-gray-300 font-medium">
            Track your momentum, not just your stats.
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#F5A623]" />
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose your login type and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Login Mode Tabs */}
            <Tabs 
              value={loginMode} 
              onValueChange={(value) => setLoginMode(value as 'athlete' | 'admin')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-900/50">
                <TabsTrigger 
                  value="athlete"
                  onClick={() => setLoginMode('athlete')}
                  className="data-[state=active]:bg-[#F5A623] data-[state=active]:text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Athlete
                </TabsTrigger>
                <TabsTrigger 
                  value="admin"
                  onClick={() => setLoginMode('admin')}
                  className="data-[state=active]:bg-[#F5A623] data-[state=active]:text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Athlete Login Form */}
              <TabsContent value="athlete">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username/Email */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">
                      Username or Email
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="john@doe.com"
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
                    className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login Form */}
              <TabsContent value="admin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Admin Email */}
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-gray-300">
                      Admin Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@catchbarrels.app"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                      className="bg-gray-900/50 border-gray-600 text-white"
                      required
                    />
                  </div>

                  {/* Admin Password */}
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-gray-300">
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={loading}
                      className="bg-gray-900/50 border-gray-600 text-white"
                      required
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">{error}</span>
                    </div>
                  )}

                  {/* Admin Info */}
                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-400">
                      <p className="font-medium mb-1">Admin Access Required</p>
                      <p className="text-blue-300/80">
                        You must have admin or coach role to access this area.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-gray-400">or</span>
              </div>
            </div>

            {/* Whop OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
                signIn('whop', { callbackUrl });
              }}
              disabled={loading}
              className="w-full border-[#F5A623]/30 text-white hover:bg-[#F5A623]/10 hover:border-[#F5A623]"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              Sign in with Whop
            </Button>

            {/* Quick Login (Dev Only) */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-500 mb-3">Quick login for testing:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('john@doe.com', 'johndoe123', false)}
                  disabled={loading}
                  className="text-xs border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  Test User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('coach@catchbarrels.app', 'CoachBarrels2024!', true)}
                  disabled={loading}
                  className="text-xs border-[#F5A623]/30 text-[#F5A623] hover:bg-[#F5A623]/10 hover:border-[#F5A623]"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Secure login powered by Whop OAuth</p>
        </div>
      </div>
    </div>
  );
}
