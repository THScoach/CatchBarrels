
'use client';

import { useState } from 'react';
import { Video, Calendar, Clock, Tag, Search, Play } from 'lucide-react';
import CoachRickChat from '@/components/coach-rick-chat';
import { format } from 'date-fns';

interface CoachingCall {
  id: string;
  title: string;
  zoomLink: string;
  description: string | null;
  callDate: Date;
  duration: number | null;
  topics: string[];
  transcript: string | null;
  createdAt: Date;
}

export default function CoachingClient({ sessions }: { sessions: CoachingCall[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<CoachingCall | null>(null);
  const [transcriptSearchQuery, setTranscriptSearchQuery] = useState('');

  // Filter sessions based on search query (includes transcript search)
  const filteredSessions = sessions.filter((session) => {
    const query = searchQuery.toLowerCase();
    return (
      session.title.toLowerCase().includes(query) ||
      session.description?.toLowerCase().includes(query) ||
      session.topics.some((topic) => topic.toLowerCase().includes(query)) ||
      session.transcript?.toLowerCase().includes(query)
    );
  });

  // Highlight search terms in transcript
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? `<mark class="bg-yellow-500/30 text-yellow-200">${part}</mark>`
        : part
    ).join('');
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0f1a] pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2332] to-[#0f1621] border-b border-[#2a3f5f] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-[#F5A623]" />
              Coaching Sessions
            </h1>
            <p className="text-sm text-[#8b949e] mt-1">
              Watch recorded Monday night coaching calls
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6a7280]" />
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-[#4a5568] mx-auto mb-4" />
              <p className="text-[#8b949e] text-lg">
                {searchQuery ? 'No sessions found' : 'No coaching sessions yet'}
              </p>
              {!searchQuery && (
                <p className="text-[#6a7280] text-sm mt-2">
                  Check back after the next Monday night call!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-[#1a2332] border border-[#2a3f5f] rounded-lg p-4 hover:border-[#F5A623] transition-colors cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  {/* Session Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {session.title}
                        </h3>
                        {session.transcript && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                            📝 Transcript
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[#8b949e]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(session.callDate), 'MMM dd, yyyy')}
                        </span>
                        {session.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-3 bg-[#F5A623] rounded-full hover:bg-[#E89815] transition-colors">
                      <Play className="w-5 h-5 text-white" fill="white" />
                    </button>
                  </div>

                  {/* Description */}
                  {session.description && (
                    <p className="text-sm text-[#8b949e] mb-3 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  {/* Topics */}
                  {session.topics.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-4 h-4 text-[#6a7280]" />
                      {session.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#2a3f5f] text-[#8b949e] text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        {selectedSession && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSession(null)}
          >
            <div
              className="bg-[#1a2332] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#2a3f5f] sticky top-0 bg-[#1a2332] z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {selectedSession.title}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-[#8b949e]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(selectedSession.callDate), 'MMM dd, yyyy')}
                      </span>
                      {selectedSession.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedSession.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-[#8b949e] hover:text-white transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="p-4">
                <div className="aspect-video bg-black rounded-lg mb-4">
                  <iframe
                    src={selectedSession.zoomLink}
                    className="w-full h-full rounded-lg"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>

                {/* Description */}
                {selectedSession.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white mb-2">
                      Session Description
                    </h3>
                    <p className="text-sm text-[#8b949e]">
                      {selectedSession.description}
                    </p>
                  </div>
                )}

                {/* Topics */}
                {selectedSession.topics.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white mb-2">
                      Topics Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#2a3f5f] text-[#8b949e] text-sm rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {selectedSession.transcript && (
                  <div className="mt-6 border-t border-[#2a3f5f] pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">
                        📝 Session Transcript
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-400 px-2 py-1 bg-orange-500/10 rounded-full border border-orange-500/30 flex items-center gap-1">
                          💬 Ask Coach Rick about this call!
                        </span>
                        <span className="text-xs text-[#6a7280]">
                          Search within transcript →
                        </span>
                      </div>
                    </div>
                    
                    {/* Transcript Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6a7280]" />
                      <input
                        type="text"
                        placeholder="Search for keywords..."
                        value={transcriptSearchQuery}
                        onChange={(e) => setTranscriptSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#0a0f1a] border border-[#2a3f5f] rounded-lg text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    {/* Transcript Content */}
                    <div className="bg-[#0a0f1a] border border-[#2a3f5f] rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-[#8b949e] whitespace-pre-wrap font-sans leading-relaxed">
                        {transcriptSearchQuery ? (
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: highlightText(selectedSession.transcript, transcriptSearchQuery) 
                            }}
                          />
                        ) : (
                          selectedSession.transcript
                        )}
                      </pre>
                    </div>

                    <p className="text-xs text-[#6a7280] mt-2 italic">
                      💡 Tip: Use the search box above to quickly find specific topics or drills discussed in this session
                    </p>
                  </div>
                )}

                {!selectedSession.transcript && (
                  <div className="mt-6 border-t border-[#2a3f5f] pt-4">
                    <div className="bg-[#2a3f5f]/30 border border-[#2a3f5f] rounded-lg p-4 text-center">
                      <p className="text-sm text-[#8b949e]">
                        ⚠️ No transcript available for this session
                      </p>
                      <p className="text-xs text-[#6a7280] mt-1">
                        Make sure Zoom transcription is enabled for future recordings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      
      {/* Coach Rick Integration - Show when viewing a session with transcript */}
      {selectedSession?.transcript && (
        <CoachRickChat 
          coachingCallId={selectedSession.id}
          coachingCallTitle={selectedSession.title}
        />
      )}
    </>
  );
}
