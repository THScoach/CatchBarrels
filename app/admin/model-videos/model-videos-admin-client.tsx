
'use client';

import { useState } from 'react';
import { Upload, Trash2, Check, X, Video as VideoIcon, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ModelVideo {
  id: string;
  title: string;
  description: string | null;
  handedness: string;
  cloudStoragePath: string;
  thumbnailUrl: string | null;
  playerName: string | null;
  playerLevel: string | null;
  active: boolean;
  uploadDate: Date;
}

interface Props {
  initialModelVideos: ModelVideo[];
}

export function ModelVideosAdminClient({ initialModelVideos }: Props) {
  const [modelVideos, setModelVideos] = useState<ModelVideo[]>(initialModelVideos);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    handedness: 'right',
    description: '',
    playerName: '',
    playerLevel: 'mlb',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      form.append('video', selectedFile);
      form.append('title', formData.title);
      form.append('handedness', formData.handedness);
      form.append('description', formData.description);
      form.append('playerName', formData.playerName);
      form.append('playerLevel', formData.playerLevel);

      const response = await fetch('/api/model-videos', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { modelVideo } = await response.json();
      setModelVideos([modelVideo, ...modelVideos]);
      
      // Reset form
      setFormData({
        title: '',
        handedness: 'right',
        description: '',
        playerName: '',
        playerLevel: 'mlb',
      });
      setSelectedFile(null);
      
      toast.success('Model video uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload model video');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/model-videos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setModelVideos(modelVideos.filter(v => v.id !== id));
      toast.success('Model video deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete model video');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/model-videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      const { modelVideo } = await response.json();
      setModelVideos(modelVideos.map(v => v.id === id ? modelVideo : v));
      toast.success(modelVideo.active ? 'Model video activated' : 'Model video deactivated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update model video');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-orange-500">Model Video Management</h1>

        {/* Upload Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Model Video
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Mike Trout - Perfect Swing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Handedness *</label>
                <select
                  required
                  value={formData.handedness}
                  onChange={(e) => setFormData({ ...formData, handedness: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="right">Right-Handed</option>
                  <option value="left">Left-Handed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Player Name</label>
                <input
                  type="text"
                  value={formData.playerName}
                  onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Mike Trout"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Player Level</label>
                <select
                  value={formData.playerLevel}
                  onChange={(e) => setFormData({ ...formData, playerLevel: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="mlb">MLB</option>
                  <option value="college">College</option>
                  <option value="pro">Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Optional description of the swing..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video File *</label>
              <input
                type="file"
                required
                accept="video/*"
                onChange={handleFileChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Model Video
                </>
              )}
            </button>
          </form>
        </div>

        {/* Model Videos List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Model Videos</h2>

          {modelVideos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No model videos uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {modelVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                    <VideoIcon className="w-8 h-8 text-gray-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{video.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {video.handedness === 'right' ? '👉 Right-Handed' : '👈 Left-Handed'}
                          {video.playerName && ` • ${video.playerName}`}
                          {video.playerLevel && ` • ${video.playerLevel.toUpperCase()}`}
                        </p>
                        {video.description && (
                          <p className="text-sm text-gray-300 mt-2">{video.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Uploaded: {new Date(video.uploadDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(video.id, video.active)}
                          className={`p-2 rounded-lg transition-colors ${
                            video.active
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                          }`}
                          title={video.active ? 'Active' : 'Inactive'}
                        >
                          {video.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
