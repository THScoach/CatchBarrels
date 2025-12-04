
'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Upload, Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  visibility: string;
  contentType: string;
  category?: string;
  published: boolean;
  featured: boolean;
  modules: any[];
  tags: any[];
  createdAt: string;
  importedAt?: string;
}

export default function KnowledgeBaseAdminClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [importMode, setImportMode] = useState(false);
  const [scrapedData, setScrapedData] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Admin panel should show ALL courses regardless of visibility
      const response = await fetch('/api/knowledge-base/courses?includeModules=true');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!scrapedData.trim()) {
      alert('Please paste scraped course data');
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);

      const courses = JSON.parse(scrapedData);
      
      const response = await fetch('/api/knowledge-base/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses,
          autoClassify: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setImportResult(data.results);
        setScrapedData('');
        setImportMode(false);
        // Refresh course list
        fetchCourses();
      } else {
        alert(`Import failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#0f1621] border-b border-[#2a3f5f] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#F5A623]" />
                Knowledge Base Management
              </h1>
              <p className="text-sm text-[#8b949e] mt-1">
                Import and manage content from membership.io
              </p>
            </div>
            
            <button
              onClick={() => setImportMode(!importMode)}
              className="px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E89815] transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {importMode ? 'Cancel Import' : 'Import Content'}
            </button>
          </div>
        </div>
      </div>

      {/* Import Mode */}
      {importMode && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-[#1a2332] border border-[#2a3f5f] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Import Scraped Content
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Step 1: Open Membership.io and Copy Content Structure
                </label>
                <div className="bg-[#0a0f1a] border border-[#2a3f5f] rounded-lg p-4 text-sm text-[#8b949e]">
                  <p className="mb-2">Use the browser automation tool to scrape your membership.io content:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Log into your membership.io account</li>
                    <li>Navigate to your course dashboard</li>
                    <li>Use browser dev tools or automated scraper to extract course structure</li>
                    <li>Copy the JSON data below</li>
                  </ol>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Step 2: Paste Scraped JSON Data
                </label>
                <textarea
                  value={scrapedData}
                  onChange={(e) => setScrapedData(e.target.value)}
                  placeholder={`Paste JSON data here. Format:
[
  {
    "title": "Course Name",
    "description": "Course description",
    "modules": [
      {
        "title": "Module 1",
        "order": 0,
        "lessons": [
          {
            "title": "Lesson 1",
            "content": "Lesson content...",
            "lessonType": "video",
            "order": 0,
            "assets": []
          }
        ]
      }
    ]
  }
]`}
                  className="w-full h-96 bg-[#0a0f1a] border border-[#2a3f5f] rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-[#F5A623] transition-colors"
                  disabled={importing}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleImport}
                  disabled={importing || !scrapedData.trim()}
                  className="px-6 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E89815] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import & Auto-Classify
                    </>
                  )}
                </button>

                {importResult && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Check className="w-4 h-4" />
                    Imported: {importResult.coursesImported} courses, {importResult.modulesImported} modules, {importResult.lessonsImported} lessons
                  </div>
                )}
              </div>

              {importResult?.errors && importResult.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-medium mb-2">Import Errors:</p>
                  <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                    {importResult.errors.map((error: string, idx: number) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Imported Courses ({courses.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-[#4a5568] mx-auto mb-4" />
            <p className="text-[#8b949e] text-lg">No courses imported yet</p>
            <p className="text-[#6a7280] text-sm mt-2">
              Click "Import Content" to start importing from membership.io
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#1a2332] border border-[#2a3f5f] rounded-lg p-4 hover:border-[#F5A623] transition-colors"
              >
                {/* Course Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#8b949e] line-clamp-2">
                      {course.description || 'No description'}
                    </p>
                  </div>
                </div>

                {/* Visibility Badge */}
                <div className="flex items-center gap-2 mb-3">
                  {course.visibility === 'athlete' ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Athlete-Facing
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Admin Only
                    </span>
                  )}
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                    {course.contentType}
                  </span>
                </div>

                {/* Stats */}
                <div className="text-xs text-[#6a7280]">
                  {course.modules.length} modules • {course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} lessons
                </div>

                {/* Import Date */}
                {course.importedAt && (
                  <div className="text-xs text-[#4a5568] mt-2">
                    Imported: {new Date(course.importedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
