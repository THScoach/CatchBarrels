'use client';

import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SupportPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportPanel({ open, onOpenChange }: SupportPanelProps) {
  const [whereHappened, setWhereHappened] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [includeDebug, setIncludeDebug] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload PNG, JPEG, or HEIC images only.',
        });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File too large', {
          description: 'Maximum screenshot size is 10MB.',
        });
        return;
      }

      setScreenshot(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whereHappened) {
      toast.error('Missing information', {
        description: 'Please select where this happened.',
      });
      return;
    }

    if (!description.trim()) {
      toast.error('Missing information', {
        description: 'Please describe what went wrong.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('whereHappened', whereHappened);
      formData.append('description', description);
      formData.append('pageUrl', window.location.href);
      formData.append('includeDebug', includeDebug.toString());

      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit ticket');
      }

      const data = await response.json();
      setTicketId(data.ticketId);
      setSuccess(true);

      toast.success('Ticket submitted!', {
        description: `Your report has been sent to Coach Rick. Ticket #${data.ticketId.slice(0, 8)}`,
      });

      // Reset form and close after 3 seconds
      setTimeout(() => {
        setWhereHappened('');
        setDescription('');
        setScreenshot(null);
        setIncludeDebug(true);
        setSuccess(false);
        setTicketId('');
        onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      console.error('Support ticket error:', error);
      toast.error('Failed to submit', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-gray-900 border-gray-700 text-white w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Something not working?</SheetTitle>
          <SheetDescription className="text-gray-400">
            Tell us what broke and add a screenshot. We'll take a look and get you
            unstuck.
          </SheetDescription>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle className="w-16 h-16 text-barrels-gold" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">
                Got it. Your report is on its way to Coach Rick.
              </h3>
              <p className="text-gray-400">Ticket ID: #{ticketId.slice(0, 8)}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Where did this happen? */}
            <div className="space-y-2">
              <Label htmlFor="where" className="text-gray-300">
                Where did this happen? <span className="text-red-400">*</span>
              </Label>
              <Select value={whereHappened} onValueChange={setWhereHappened}>
                <SelectTrigger
                  id="where"
                  className="bg-gray-800 border-gray-600 text-white"
                >
                  <SelectValue placeholder="Select a location..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="Dashboard">Dashboard</SelectItem>
                  <SelectItem value="New Lesson">New Lesson</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Momentum Transfer Card">
                    Momentum Transfer Card
                  </SelectItem>
                  <SelectItem value="Video Upload">Video Upload</SelectItem>
                  <SelectItem value="Profile">Profile</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* What went wrong? */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                What went wrong? <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened..."
                rows={5}
                className="bg-gray-800 border-gray-600 text-white resize-none"
                disabled={submitting}
              />
            </div>

            {/* Screenshot upload */}
            <div className="space-y-2">
              <Label htmlFor="screenshot" className="text-gray-300">
                Add screenshot (optional but recommended)
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  screenshot
                    ? 'border-barrels-gold bg-barrels-gold/10'
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                {screenshot ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-barrels-gold mx-auto" />
                    <p className="text-sm text-gray-300 font-medium">
                      {screenshot.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(screenshot.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setScreenshot(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                    <p className="text-sm text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPEG, HEIC (max 10MB)
                    </p>
                  </div>
                )}
                <input
                  id="screenshot"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/heic"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={submitting}
                />
                {!screenshot && (
                  <label htmlFor="screenshot" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => document.getElementById('screenshot')?.click()}
                    >
                      Select File
                    </Button>
                  </label>
                )}
              </div>
            </div>

            {/* Debug info toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="space-y-1">
                <Label htmlFor="debug" className="text-gray-300 text-sm font-medium">
                  Include debug info
                </Label>
                <p className="text-xs text-gray-500">
                  Include device and browser details to help Coach Rick debug this
                  faster.
                </p>
              </div>
              <Switch
                id="debug"
                checked={includeDebug}
                onCheckedChange={setIncludeDebug}
                disabled={submitting}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="flex-1 text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !whereHappened || !description.trim()}
                className="flex-1 bg-barrels-gold hover:bg-barrels-gold-light text-black font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send to Coach Rick'
                )}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
