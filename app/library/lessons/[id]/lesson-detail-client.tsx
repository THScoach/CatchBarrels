
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, BookOpen, Video, ArrowLeft, MessageCircle } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import CoachRickChat from '@/components/coach-rick-chat';

interface LessonDetailClientProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    lessonType: string;
    sourceUrl: string | null;
    module: {
      title: string;
      course: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        thumbnail: string | null;
      };
    };
    assets: Array<{
      id: string;
      title: string;
      assetType: string;
      fileUrl: string | null;
      originalUrl: string | null;
    }>;
  };
}

export default function LessonDetailClient({ lesson }: LessonDetailClientProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] text-white pb-20">
      {/* Header */}
      <div className="bg-[#1a2332] border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <BookOpen className="w-3 h-3" />
              {lesson.module.course.title} › {lesson.module.title}
            </div>
            <h1 className="text-lg font-semibold mt-0.5">{lesson.title}</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Lesson Description */}
        {lesson.description && (
          <div className="bg-[#1e293b] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-300 leading-relaxed">{lesson.description}</p>
          </div>
        )}

        {/* Watch on membership.io CTA */}
        {lesson.sourceUrl && (
          <div className="bg-gradient-to-r from-orange-600 to-blue-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Watch Full Video</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Access the complete training video with demonstrations and detailed explanations on membership.io
                </p>
                <a
                  href={lesson.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open on membership.io
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Course Context */}
        <div className="bg-[#1e293b] rounded-xl p-4 border border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-400" />
            Course Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Course:</span>
              <Link href="/library" className="text-orange-400 hover:text-blue-300">
                {lesson.module.course.title}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Module:</span>
              <span className="text-gray-200">{lesson.module.title}</span>
            </div>
            {lesson.module.course.category && (
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                  {lesson.module.course.category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        {lesson.content && (
          <div className="bg-[#1e293b] rounded-xl p-5 border border-gray-700">
            <h3 className="font-semibold mb-4 text-lg">Lesson Details</h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <div
                className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        )}

        {/* Ask Coach Rick */}
        <div className="bg-gradient-to-r from-purple-600/20 to-orange-600/20 rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/30 rounded-lg p-2">
              <MessageCircle className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-semibold">Questions About This Lesson?</h3>
              <p className="text-sm text-gray-400">Ask Coach Rick for personalized guidance</p>
            </div>
          </div>
          <button
            onClick={() => setShowChat(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Coach Rick
          </button>
        </div>
      </div>

      {/* Coach Rick Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#1a2332] w-full sm:max-w-2xl sm:rounded-t-2xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold">Coach Rick - {lesson.title}</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CoachRickChat />
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
