import { prisma } from '@/lib/db';
import SupportClient from './support-client';

export default async function SupportPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
    },
  });

  return <SupportClient tickets={tickets} />;
}
