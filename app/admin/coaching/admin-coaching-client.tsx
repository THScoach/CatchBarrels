
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Loader2, Calendar, Clock, Tag, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminCoachingClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transcriptStatus, setTranscriptStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    zoomLink: '',
    description: '',
    callDate: '',
    duration: '',
    topics: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setTranscriptStatus('');

    try {
      // Convert topics string to array
      const topicsArray = formData.topics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topics: topicsArray
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add coaching session');
      }

      const data = await response.json();
      
      // Check if transcript was fetched
      if (data.transcript) {
        setTranscriptStatus('✅ Transcript fetched successfully!');
      } else {
        setTranscriptStatus('⚠️ Session added, but no transcript available (make sure Zoom transcription is enabled)');
      }

      setSuccess(true);
      setFormData({
        title: '',
        zoomLink: '',
        description: '',
        callDate: '',
        duration: '',
        topics: ''
      });

      // Redirect to coaching page after 2.5 seconds
      setTimeout(() => {
        router.push('/coaching');
      }, 2500);
    } catch (error) {
      console.error('Error adding coaching session:', error);
      alert('Failed to add coaching session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#0f1621] border-b border-[#2a3f5f] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-[#2a3f5f] rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#8b949e]" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Add Coaching Session</h1>
              <p className="text-sm text-[#8b949e]">Paste Zoom recording link</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {success && (
          <div className="mb-6 space-y-2">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-center">✅ Coaching session added successfully! Redirecting...</p>
            </div>
            {transcriptStatus && (
              <div className={`p-4 rounded-lg text-center ${
                transcriptStatus.includes('✅') 
                  ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                  : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
              }`}>
                <p>{transcriptStatus}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Session Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Monday Night Coaching - Nov 23"
              className="w-full px-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          {/* Zoom Link */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              Zoom Recording Link *
            </label>
            <input
              type="url"
              required
              value={formData.zoomLink}
              onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
              placeholder="https://us06web.zoom.us/rec/share/..."
              className="w-full px-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
            <p className="text-xs text-[#6a7280] mt-1">
              Paste the full Zoom recording link from your email notification
            </p>
          </div>

          {/* Call Date */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Call Date *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.callDate}
              onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="45"
              min="1"
              className="w-full px-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Topics Covered
            </label>
            <input
              type="text"
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              placeholder="Hip Rotation, Weight Shift, Separation"
              className="w-full px-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
            <p className="text-xs text-[#6a7280] mt-1">
              Separate multiple topics with commas
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of what was covered in this session..."
              rows={4}
              className="w-full px-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-[#F5A623] transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#F5A623] to-[#E89815] text-white font-semibold rounded-lg hover:from-[#E89815] hover:to-[#D88A0C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Session...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Coaching Session
              </>
            )}
          </button>
        </form>

        {/* Helper Text */}
        <div className="mt-6 p-4 bg-[#1a2332] border border-[#2a3f5f] rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">📋 How to get your Zoom link:</h3>
          <ol className="text-sm text-[#8b949e] space-y-1 list-decimal list-inside">
            <li>After your Monday coaching call ends, Zoom will send you an email</li>
            <li>Look for "Cloud Recording - [Meeting Name] is now available"</li>
            <li>Open the email and click "View Recording"</li>
            <li>Copy the full URL from your browser</li>
            <li>Paste it in the "Zoom Recording Link" field above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
