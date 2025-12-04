"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, XCircle, Clock, MapPin, FileText } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  userId: string;
  status: string;
  attendedAt: Date | null;
  markedBy: string | null;
  notes: string | null;
  // Diamond Kinetics Metrics (WO15)
  swingsCaptured?: number | null;
  avgBarrelSpeed?: number | null;
  avgImpactMomentum?: number | null;
  avgAttackAngle?: number | null;
  avgHandSpeed?: number | null;
  avgTimeToContact?: number | null;
  dkSessionId?: string | null;
  barrelsScore?: number | null;
  sequenceGrade?: string | null;
  dkSyncedAt?: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
  };
}

interface PodSlot {
  id: string;
  date: Date;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxAthletes: number;
  bookings: Booking[];
}

interface PodsAdminClientProps {
  slots: PodSlot[];
}

export default function PodsAdminClient({ slots }: PodsAdminClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const dateKey = format(new Date(slot.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, PodSlot[]>);

  const dates = Object.keys(groupedSlots).map((key) => new Date(key)).sort((a, b) => a.getTime() - b.getTime());

  const handleMarkAttendance = async (bookingId: string, status: 'attended' | 'no_show') => {
    setUpdating(bookingId);

    try {
      const response = await fetch(`/api/admin/pods/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      toast.success(`Marked as ${status === 'attended' ? 'attended' : 'no-show'}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update attendance');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="w-6 h-6 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">POD Management</h1>
          <p className="text-gray-400">View and manage POD sessions</p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Select Date</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {dates.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const dateSlots = groupedSlots[format(date, 'yyyy-MM-dd')];
            const totalBookings = dateSlots.reduce((sum, slot) => sum + slot.bookings.length, 0);

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
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-400">{format(date, 'EEE')}</p>
                  <p className="text-lg font-semibold text-white">{format(date, 'MMM d')}</p>
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                    {totalBookings} booked
                  </Badge>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Slots for Selected Date */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>

          {groupedSlots[format(selectedDate, 'yyyy-MM-dd')]?.map((slot) => (
            <Card key={slot.id} className="bg-barrels-black-light border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    {slot.startTime} - {slot.endTime}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`${
                      slot.bookings.length === slot.maxAthletes
                        ? 'border-red-500/30 text-red-400'
                        : 'border-green-500/30 text-green-400'
                    }`}
                  >
                    {slot.bookings.length} / {slot.maxAthletes} athletes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {slot.bookings.length === 0 ? (
                  <p className="text-gray-500 text-sm">No bookings for this slot</p>
                ) : (
                  slot.bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-barrels-black rounded-lg border border-gray-800"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white">
                              {booking.user.name || booking.user.username || booking.user.email}
                            </p>
                            {booking.status === 'attended' && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Attended
                              </Badge>
                            )}
                            {booking.status === 'no_show' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                No-Show
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{booking.user.email}</p>
                          
                          {/* DK Metrics Display (WO15) */}
                          {booking.swingsCaptured !== null && booking.swingsCaptured !== undefined && (
                            <div className="mt-2 p-3 bg-purple-900/20 rounded border border-purple-700/30">
                              <p className="text-xs text-purple-300 font-medium mb-2">Diamond Kinetics Metrics</p>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="text-gray-300">
                                  <span className="font-semibold text-white">{booking.swingsCaptured}</span> swings
                                </span>
                                {booking.avgBarrelSpeed && (
                                  <span className="text-gray-300">
                                    <span className="font-semibold text-white">{booking.avgBarrelSpeed.toFixed(1)}</span> mph
                                  </span>
                                )}
                                {booking.avgImpactMomentum && (
                                  <span className="text-gray-300">
                                    <span className="font-semibold text-white">{booking.avgImpactMomentum.toFixed(1)}</span> momentum
                                  </span>
                                )}
                                {booking.barrelsScore && (
                                  <span className="text-gray-300">
                                    score{' '}
                                    <span className={`font-semibold ${
                                      booking.sequenceGrade === 'green' ? 'text-green-400' :
                                      booking.sequenceGrade === 'yellow' ? 'text-yellow-400' :
                                      'text-red-400'
                                    }`}>
                                      {booking.barrelsScore.toFixed(0)}
                                    </span>
                                    {booking.sequenceGrade && (
                                      <span className="ml-1">
                                        ({booking.sequenceGrade})
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {booking.notes && (
                            <div className="mt-2 p-2 bg-gray-900/50 rounded border border-gray-800">
                              <p className="text-xs text-gray-400 flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                {booking.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {booking.status === 'confirmed' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(booking.id, 'attended')}
                              disabled={updating === booking.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Attended
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(booking.id, 'no_show')}
                              disabled={updating === booking.id}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              No-Show
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {!selectedDate && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-blue-300">Select a date to view POD sessions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
