import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import LoginClient from './login-client';

export default async function LoginPage() {
  // If already authenticated, redirect to dashboard
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  // Show the login form
  return <LoginClient />;
}
