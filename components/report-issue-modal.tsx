'use client';

import { useState } from 'react';
import { X, Upload, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  videoId?: string;
}

export function ReportIssueModal({ isOpen, onClose, sessionId, videoId }: ReportIssueModalProps) {
  const [description, setDescription] = useState('');
  const [whereHappened, setWhereHappened] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG)');
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    if (!whereHappened.trim()) {
      toast.error('Please tell us where this happened');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('whereHappened', whereHappened);
      if (sessionId) formData.append('sessionId', sessionId);
      if (videoId) formData.append('videoId', videoId);
      if (screenshot) formData.append('screenshot', screenshot);
      formData.append('pageUrl', window.location.href);
      formData.append('userAgent', navigator.userAgent);

      const response = await fetch('/api/support/report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast.success('Issue reported successfully! Our team will review it.');
      onClose();
      setDescription('');
      setWhereHappened('');
      setScreenshot(null);
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#E8B14E]/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#E8B14E]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Report an Issue</h2>
                  <p className="text-sm text-gray-400">Help us improve CatchBarrels</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#E8B14E]/10 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Where Happened */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Where did this happen? <span className="text-red-400">*</span>
                </label>
                <select
                  value={whereHappened}
                  onChange={(e) => setWhereHappened(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black/50 border border-[#E8B14E]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E8B14E]/50"
                >
                  <option value="">Select a page...</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="New Lesson">New Lesson</option>
                  <option value="Upload Video">Upload Video</option>
                  <option value="Video Analysis">Video Analysis</option>
                  <option value="History">History</option>
                  <option value="Profile">Profile</option>
                  <option value="Drills">Drills</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe the issue <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Tell us what went wrong..."
                  className="w-full px-4 py-2 bg-black/50 border border-[#E8B14E]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E8B14E]/50 resize-none"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Screenshot (optional)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 bg-black/50 border border-[#E8B14E]/20 rounded-lg cursor-pointer hover:bg-[#E8B14E]/5 transition">
                    <Upload className="w-5 h-5 text-[#E8B14E] mr-2" />
                    <span className="text-gray-300 text-sm">
                      {screenshot ? screenshot.name : 'Upload screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {screenshot && (
                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">PNG or JPG, max 5MB</p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-black/50 text-gray-300 rounded-lg hover:bg-black/70 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#E8B14E] to-[#F5C76E] text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
