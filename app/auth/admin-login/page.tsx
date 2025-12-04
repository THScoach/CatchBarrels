import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import AdminLoginClient from './admin-login-client';

export default async function AdminLoginPage() {
  // If already authenticated, redirect to admin dashboard
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/admin/assessments');
  }

  return <AdminLoginClient />;
}
