
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import CommunityClient from './community-client';

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  
  // Optional: Require authentication to view community
  // if (!session?.user) {
  //   redirect('/auth/login');
  // }

  return <CommunityClient />;
}
