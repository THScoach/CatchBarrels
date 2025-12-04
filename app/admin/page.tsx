import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getAdminDashboardData } from '@/lib/admin/getAdminDashboardData';
import AdminDashboardClient from './admin-dashboard-client';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch admin dashboard data
  const data = await getAdminDashboardData();

  return <AdminDashboardClient data={data} />;
}
