'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


interface SupportTicket {
  id: string;
  userEmail: string | null;
  role: string | null;
  whereHappened: string;
  description: string;
  screenshotUrl: string | null;
  screenshotSignedUrl: string | null;
  pageUrl: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    role: string | null;
  } | null;
}

export function SupportTicketsClient() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingTicket(ticketId);

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update ticket');

      // Update local state
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );

      toast.success('Status updated', {
        description: `Ticket marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingTicket(null);
    }
  };

  const openScreenshot = (signedUrl: string) => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      toast.error('Screenshot URL not available');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-barrels-gold animate-spin" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
        <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          No support tickets yet
        </h3>
        <p className="text-gray-400">
          When athletes report bugs, they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-red-400">
              {tickets.filter((t) => t.status === 'open').length}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">Open</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">
              {tickets.filter((t) => t.status === 'in_progress').length}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">In Progress</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-green-400">
              {tickets.filter((t) => t.status === 'resolved').length}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">Resolved</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800/50">
              <TableHead className="text-gray-300">Created</TableHead>
              <TableHead className="text-gray-300">User</TableHead>
              <TableHead className="text-gray-300">Where</TableHead>
              <TableHead className="text-gray-300">Description</TableHead>
              <TableHead className="text-gray-300">Screenshot</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="border-gray-700 hover:bg-gray-800/30"
              >
                <TableCell className="text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-white text-sm font-medium">
                      {ticket.user?.name || ticket.userEmail || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ticket.user?.email || ticket.userEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-gray-700/50 text-gray-300 border-gray-600"
                  >
                    {ticket.whereHappened}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {ticket.description}
                  </p>
                  {ticket.pageUrl && (
                    <a
                      href={ticket.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-barrels-gold hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View page
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  {ticket.screenshotSignedUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openScreenshot(ticket.screenshotSignedUrl!)}
                      className="border-barrels-gold/30 text-barrels-gold hover:bg-barrels-gold/10"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-500">No screenshot</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                    disabled={updatingTicket === ticket.id}
                  >
                    <SelectTrigger
                      className={`w-36 ${getStatusColor(ticket.status)}`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
