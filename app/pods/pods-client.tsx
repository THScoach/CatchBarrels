"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, AlertCircle, Crown, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSaturday, isSunday } from 'date-fns';
import UpgradeModal from '@/components/upgrade-modal';
import type { MembershipTier } from '@/lib/membership-tiers';

interface PodSlot {
  id: string;
  date: Date;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxAthletes: number;
  bookings: Array<{
    id: string;
    userId: string;
    status: string;
  }>;
}

interface PodBooking {
  id: string;
  podSlot: {
    id: string;
    date: Date;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  status: string;
}

interface PodsClientProps {
  initialSlots: PodSlot[];
  userBookings: PodBooking[];
  podCredits: number;
  userTier: string;
}

export default function PodsClient({
  initialSlots,
  userBookings,
  podCredits,
  userTier,
}: PodsClientProps) {
  const router = useRouter();
  const [slots, setSlots] = useState<PodSlot[]>(initialSlots);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Upgrade modal state (WO16)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Get next 4 weekends (Saturdays and Sundays)
  const getUpcomingWeekends = () => {
    const weekends: Date[] = [];
    let currentDate = new Date();
    
    while (weekends.length < 8) { // 4 weekends = 8 days
      if (isSaturday(currentDate) || isSunday(currentDate)) {
        weekends.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return weekends;
  };

  const weekends = getUpcomingWeekends();

  // Filter slots by selected date
  const filteredSlots = selectedDate
    ? slots.filter((slot) => {
        const slotDate = new Date(slot.date);
        return (
          slotDate.getDate() === selectedDate.getDate() &&
          slotDate.getMonth() === selectedDate.getMonth() &&
          slotDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const handleBookPod = async (slotId: string) => {
    if (podCredits <= 0) {
      toast.error('No POD credits available');
      return;
    }

    setBookingSlotId(slotId);
    setLoading(true);

    try {
      const response = await fetch('/api/pods/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podSlotId: slotId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book POD');
      }

      toast.success('POD session booked successfully!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to book POD');
    } finally {
      setLoading(false);
      setBookingSlotId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/pods/book/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      toast.success('Booking cancelled successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSpots = (slot: PodSlot) => {
    const confirmedBookings = slot.bookings.filter(
      (b) => b.status === 'confirmed'
    ).length;
    return slot.maxAthletes - confirmedBookings;
  };

  const isUserBooked = (slotId: string) => {
    return userBookings.some((b) => b.podSlot.id === slotId && b.status === 'confirmed');
  };

  // Upsell state for non-Hybrid users
  if (userTier !== 'hybrid') {
    return (
      <div className="min-h-screen bg-barrels-black pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">POD Sessions</h1>
            <p className="text-gray-400">In-person training at our facility</p>
          </div>

          {/* Upsell Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">POD Training Available on Hybrid Plan</h2>
                  <p className="text-gray-300 text-lg">
                    Get 1 in-person POD session per month plus 1 remote lesson per week
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center text-gray-300">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span>Weekend sessions (Sat/Sun)</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center text-gray-300">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Small groups (max 3 athletes)</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center text-gray-300">
                    <Crown className="w-5 h-5 text-purple-400" />
                    <span>Priority booking & coaching</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold"
                  >
                    See Hybrid Plan
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Current plan: {userTier === 'free' ? 'Free' : userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upgrade Modal (WO16) */}
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          currentTier={userTier as MembershipTier}
          reason="no_access"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-barrels-black pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Book POD Session</h1>
          <p className="text-gray-400">Schedule your in-person training</p>
        </div>

        {/* Credits Display */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">POD Credits Available</p>
                  <p className="text-2xl font-bold text-purple-400">{podCredits}</p>
                </div>
              </div>
              {podCredits === 0 && (
                <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                  Used this month
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Bookings */}
        {userBookings.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">My Upcoming PODs</h2>
            <div className="space-y-2">
              {userBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-barrels-black-light border-green-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="font-medium text-white">
                              {booking.podSlot.dayOfWeek}, {format(new Date(booking.podSlot.date), 'MMM d')}
                            </p>
                            <p className="text-sm text-gray-400">
                              {booking.podSlot.startTime} - {booking.podSlot.endTime}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={loading}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Select a Weekend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekends.map((date) => {
              const isSelected = selectedDate && 
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth();
              
              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-barrels-black-light border-gray-700 hover:border-purple-500/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      {format(date, 'EEE')}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {format(date, 'MMM d')}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h2 className="text-xl font-semibold text-white">
              Available Times - {format(selectedDate, 'EEEE, MMMM d')}
            </h2>

            {filteredSlots.length === 0 ? (
              <Card className="bg-barrels-black-light border-gray-700">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No slots available for this date</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Slots are released weekly. Check back soon!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredSlots.map((slot) => {
                  const availableSpots = getAvailableSpots(slot);
                  const isFull = availableSpots === 0;
                  const isBooked = isUserBooked(slot.id);
                  const isBooking = bookingSlotId === slot.id;

                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className={`bg-barrels-black-light border ${
                        isFull ? 'border-gray-700' : 'border-purple-500/30 hover:border-purple-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">
                                  {slot.startTime}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {slot.endTime}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className={`text-sm ${
                                    availableSpots > 1 ? 'text-green-400' : 
                                    availableSpots === 1 ? 'text-yellow-400' : 
                                    'text-red-400'
                                  }`}>
                                    {availableSpots} / {slot.maxAthletes} spots available
                                  </span>
                                </div>
                                {isFull && (
                                  <Badge variant="outline" className="border-red-500/30 text-red-400">
                                    Full
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div>
                              {isBooked ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Booked
                                </Badge>
                              ) : isFull || podCredits === 0 ? (
                                <Button disabled variant="outline" className="border-gray-700">
                                  {podCredits === 0 ? 'No Credits' : 'Full'}
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleBookPod(slot.id)}
                                  disabled={isBooking || loading}
                                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                                >
                                  {isBooking ? 'Booking...' : 'Book Now'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Info Notice */}
        {!selectedDate && (
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-300">
                    POD Training Schedule
                  </p>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Sessions run on Saturdays and Sundays only</li>
                    <li>• Maximum 3 athletes per pod for personalized attention</li>
                    <li>• Booking uses 1 POD credit (resets monthly)</li>
                    <li>• Cancel up to 24 hours before for credit refund</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
