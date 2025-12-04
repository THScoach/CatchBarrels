
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import AdminCoachingClient from './admin-coaching-client';

export default async function AdminCoachingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // TODO: Add admin role check here once you have admin roles
  // For now, any logged-in user can access (you can change this later)
  
  return <AdminCoachingClient />;
}
