'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, Eye, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Ticket {
  id: string;
  userId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
  } | null;
  userEmail: string | null;
  role: string | null;
  whereHappened: string;
  description: string;
  screenshotUrl: string | null;
  userAgent: string | null;
  pageUrl: string | null;
  extraContext: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SupportClientProps {
  tickets: Ticket[];
}

export default function SupportClient({ tickets: initialTickets }: SupportClientProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-[#E8B14E]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-[#E8B14E]/20 text-[#E8B14E]';
      default:
        return 'bg-red-500/20 text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-gray-400 mt-1">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} total
          </p>
        </div>
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {['all', 'open', 'in_progress', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? 'bg-[#E8B14E]/20 text-[#E8B14E]'
                  : 'bg-black/50 text-gray-400 hover:text-gray-300'
              }`}
            >
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8B14E]/10">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-[#E8B14E]/5 transition cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start space-x-4">
                  <div>{getStatusIcon(ticket.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-medium">{ticket.whereHappened}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {ticket.user && (
                        <span>
                          {ticket.user.name || ticket.user.username} ({ticket.user.email || ticket.userEmail})
                        </span>
                      )}
                      {ticket.screenshotUrl && (
                        <span className="flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Screenshot attached</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTicket(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.whereHappened}</h2>
                <p className="text-sm text-gray-400">
                  {format(new Date(selectedTicket.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-white transition"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Status</label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                    selectedTicket.status
                  )}`}
                >
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>

              {selectedTicket.user && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">User</label>
                  <div className="bg-black/50 rounded-lg p-3">
                    <p className="text-white font-medium">
                      {selectedTicket.user.name || selectedTicket.user.username}
                    </p>
                    <p className="text-gray-400 text-sm">{selectedTicket.user.email || selectedTicket.userEmail}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <div className="bg-black/50 rounded-lg p-4 text-gray-300">{selectedTicket.description}</div>
              </div>

              {selectedTicket.pageUrl && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Page URL</label>
                  <div className="bg-black/50 rounded-lg p-3">
                    <a
                      href={selectedTicket.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E8B14E] hover:text-[#F5C76E] text-sm break-all"
                    >
                      {selectedTicket.pageUrl}
                    </a>
                  </div>
                </div>
              )}

              {selectedTicket.screenshotUrl && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Screenshot</label>
                  <div className="bg-black/50 rounded-lg p-3">
                    <img
                      src={selectedTicket.screenshotUrl}
                      alt="Bug screenshot"
                      className="max-w-full rounded-lg"
                    />
                  </div>
                </div>
              )}

              {selectedTicket.userAgent && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">User Agent</label>
                  <div className="bg-black/50 rounded-lg p-3 text-xs text-gray-400 break-all">
                    {selectedTicket.userAgent}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
