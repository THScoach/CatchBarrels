import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export default async function CoachPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to admin if authenticated and is coach/admin
  if (session?.user && ((session.user as any).role === 'admin' || (session.user as any).role === 'coach')) {
    redirect('/admin');
  }
  
  // Otherwise redirect to dashboard
  redirect('/dashboard');
}
