
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Upload, 
  Link2, 
  ExternalLink, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Video as VideoIcon,
  Info,
  Zap,
  Download,
  Cloud
} from 'lucide-react';
import type { OnFormImportPanelProps, Video } from '@/lib/types';
import { VIDEO_TYPES } from '@/lib/types';

export function OnFormImportPanel({
  athleteId,
  sessionId,
  onImported,
  open,
  onOpenChange
}: OnFormImportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'link'>('file');
  const [onformUrl, setOnformUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<string>('');
  const [cameraAngle, setCameraAngle] = useState<string>('side');
  const [showInstructions, setShowInstructions] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMB, setUploadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      setTotalMB(fileSizeInMB);
      
      // Get file extension
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const supportedFormats = ['.mp4', '.mov', '.avi', '.wmv', '.webm', '.m4v', '.mpeg', '.mpg'];
      
      // Validate format IMMEDIATELY
      if (!supportedFormats.includes(fileExtension)) {
        toast.error('Unsupported video format', {
          description: `${fileExtension} files are not supported. Please use: MP4, MOV, AVI, WMV, WEBM, M4V, or MPEG.`,
          duration: 6000
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check file size IMMEDIATELY
      if (fileSizeInMB > 500) {
        toast.error('File too large', {
          description: `This file is ${fileSizeInMB.toFixed(0)}MB. OnForm videos must be under 500MB. Please compress or trim the video in OnForm first.`,
          duration: 6000
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Warn for large files (will take time)
      if (fileSizeInMB > 100) {
        toast.warning('Large file detected', {
          description: `This ${fileSizeInMB.toFixed(0)}MB video may take 2-5 minutes to upload. Please be patient and don't close this window.`,
          duration: 6000
        });
      }
      
      setVideoFile(file);
      
      // Show format-specific success message
      const formatInfo = fileExtension === '.mov' ? ' (iOS QuickTime)' : fileExtension === '.mp4' ? ' (MP4)' : '';
      toast.success('File selected', {
        description: `${file.name}${formatInfo} (${fileSizeInMB.toFixed(1)} MB)${fileSizeInMB > 50 ? ' - This may take a few minutes' : ''}`
      });
    }
  };

  const handleFileImport = async () => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!videoType) {
      toast.error('Please select a video type');
      return;
    }

    setImporting(true);
    setUploadProgress(0);
    
    const fileSizeMB = videoFile.size / (1024 * 1024);
    setTotalMB(fileSizeMB);
    setUploadedMB(0);
    
    // Show immediate feedback
    toast.info('🚀 Starting upload...', {
      description: `Uploading ${videoFile.name} (${fileSizeMB.toFixed(1)}MB). This may take a few minutes.`,
      duration: 3000
    });

    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('videoType', videoType);
      formData.append('source', 'onform');
      formData.append('cameraAngle', cameraAngle);
      if (athleteId) formData.append('athleteId', athleteId);
      if (sessionId) formData.append('sessionId', sessionId);

      // Use XMLHttpRequest for progress tracking with stall detection
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Detect iOS/iPad
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        // Set a timeout based on file size (2 minutes for first 100MB, then 1 min per additional 100MB)
        // Max 10 minutes, min 2 minutes
        const timeoutMinutes = Math.min(10, Math.max(2, Math.ceil(fileSizeMB / 100) * 2));
        xhr.timeout = timeoutMinutes * 60 * 1000;
        
        console.log(`[OnForm Upload] Starting upload of ${fileSizeMB.toFixed(1)}MB with ${timeoutMinutes}-minute timeout`);

        // Stall detection: track last progress update
        let lastProgressTime = Date.now();
        let lastProgressBytes = 0;
        let stallWarningShown = false;
        
        // Check for stalls every 15 seconds
        const stallCheckInterval = setInterval(() => {
          const timeSinceProgress = Date.now() - lastProgressTime;
          const currentProgress = uploadProgress;
          
          // If no progress for 30 seconds and not complete
          if (timeSinceProgress > 30000 && currentProgress < 100 && !stallWarningShown) {
            stallWarningShown = true;
            console.warn(`[OnForm Upload] Stalled for 30+ seconds at ${currentProgress}%`);
            
            toast.warning('Upload may be stalled', {
              description: isIOS 
                ? '⚠️ iPad connection unstable. Stay on this screen and keep Safari open. Consider switching to a stronger Wi-Fi network.'
                : '⚠️ Connection unstable. Please keep this window open and wait...',
              duration: 8000
            });
          }
          
          // If no progress for 60 seconds, abort
          if (timeSinceProgress > 60000 && currentProgress < 100) {
            console.error(`[OnForm Upload] No progress for 60 seconds, aborting`);
            clearInterval(stallCheckInterval);
            xhr.abort();
            reject(new Error('Upload stalled. Your connection may be too slow or unstable. Please try: (1) Moving closer to your Wi-Fi router (2) Restarting your device (3) Compressing the video in OnForm first'));
          }
        }, 15000);

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            const uploadedMegabytes = e.loaded / (1024 * 1024);
            
            // Update progress state
            setUploadProgress(Math.round(percentComplete));
            setUploadedMB(uploadedMegabytes);
            
            // Track for stall detection
            if (e.loaded > lastProgressBytes) {
              lastProgressTime = Date.now();
              lastProgressBytes = e.loaded;
              stallWarningShown = false; // Reset warning flag
            }
            
            console.log(`[OnForm Upload] Progress: ${percentComplete.toFixed(1)}% (${uploadedMegabytes.toFixed(1)}/${fileSizeMB.toFixed(1)} MB)`);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          clearInterval(stallCheckInterval);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log(`[OnForm Upload] Success! Video ID: ${response.video?.id}`);
              resolve(response);
            } catch (e) {
              console.error('[OnForm Upload] Invalid server response:', e);
              reject(new Error('Invalid server response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error(`[OnForm Upload] Server error ${xhr.status}:`, errorData);
              reject(new Error(errorData.error || 'Upload failed'));
            } catch (e) {
              console.error(`[OnForm Upload] Failed with status ${xhr.status}`);
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          clearInterval(stallCheckInterval);
          console.error('[OnForm Upload] Network error occurred');
          
          // iOS-specific guidance
          if (isIOS) {
            reject(new Error('❌ iPad network error. This often happens with large files on cellular or weak Wi-Fi. Try: (1) Switch to a strong Wi-Fi network (2) Close other apps to free memory (3) Compress the video in OnForm (4) Try uploading from a computer'));
          } else {
            reject(new Error('Network error during upload. Please check your connection and try again.'));
          }
        });

        xhr.addEventListener('abort', () => {
          clearInterval(stallCheckInterval);
          console.log('[OnForm Upload] Upload aborted');
          reject(new Error('Upload cancelled or stalled'));
        });
        
        xhr.addEventListener('timeout', () => {
          clearInterval(stallCheckInterval);
          console.error(`[OnForm Upload] Timeout after ${timeoutMinutes} minutes`);
          
          // iOS-specific timeout guidance
          if (isIOS) {
            reject(new Error(`⏱️ Upload timed out after ${timeoutMinutes} minutes. iPad uploads can be slower on cellular/weak Wi-Fi. Try: (1) Connect to faster Wi-Fi (2) Compress video in OnForm first (3) Upload from a computer instead`));
          } else {
            reject(new Error(`Upload timed out after ${timeoutMinutes} minutes. The file may be too large or your internet connection is slow. Try compressing the video or using a faster connection.`));
          }
        });

        // Send request
        console.log(`[OnForm Upload] Sending POST request to /api/videos/onform/import`);
        xhr.open('POST', '/api/videos/onform/import');
        xhr.send(formData);
      });
      
      toast.success('🎉 OnForm video imported!', {
        description: 'Video uploaded successfully. Analysis will begin automatically.',
        duration: 4000
      });

      if (onImported && result.video) {
        onImported({
          videoId: result.video.id,
          athleteId: result.video.userId,
          sessionId: sessionId,
          video: result.video
        });
      }

      // Reset and close
      setVideoFile(null);
      setOnformUrl('');
      setVideoType('');
      setCameraAngle('side');
      setUploadProgress(0);
      setUploadedMB(0);
      setTotalMB(0);
      onOpenChange(false);

    } catch (error) {
      console.error('[OnForm Upload] Error importing OnForm video:', error);
      
      // Enhanced error message with more context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Show different toast based on error type
      if (errorMessage.includes('stalled') || errorMessage.includes('timeout') || errorMessage.includes('network')) {
        toast.error('Upload Failed - Network Issue', {
          description: errorMessage,
          duration: 10000 // Longer duration for actionable errors
        });
        
        // If iOS, show additional help
        if (isIOS) {
          setTimeout(() => {
            toast.info('💡 iPad Upload Tips', {
              description: 'Large videos (>50MB) often fail on iPad. Best option: Upload from your computer, or compress the video in OnForm first.',
              duration: 8000
            });
          }, 2000);
        }
      } else {
        toast.error('Failed to import video', {
          description: errorMessage || 'Please try again or contact support',
          duration: 6000
        });
      }
      
      setUploadProgress(0);
      setUploadedMB(0);
      setTotalMB(0);
    } finally {
      setImporting(false);
    }
  };

  const handleLinkImport = async () => {
    if (!onformUrl.trim()) {
      toast.error('Please paste an OnForm link');
      return;
    }

    if (!videoType) {
      toast.error('Please select a video type');
      return;
    }
    
    // Validate URL format immediately
    const trimmedUrl = onformUrl.trim();
    try {
      new URL(trimmedUrl);
    } catch (e) {
      toast.error('Invalid URL', {
        description: 'Please paste a valid OnForm share link (e.g., https://onform.com/share/...)',
        duration: 5000
      });
      return;
    }
    
    // Check if it looks like an OnForm URL
    if (!trimmedUrl.toLowerCase().includes('onform')) {
      toast.warning('This doesn\'t look like an OnForm link', {
        description: 'Make sure you copied the share link from the OnForm app.',
        duration: 5000
      });
    }

    setImporting(true);
    
    // Show immediate feedback
    toast.info('🔗 Importing from OnForm...', {
      description: 'Validating share link and creating video record.',
      duration: 3000
    });
    
    try {
      // Create an abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/videos/onform/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareUrl: trimmedUrl,
          videoType,
          cameraAngle,
          source: 'onform',
          athleteId,
          sessionId
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Import failed' }));
        throw new Error(errorData.error || 'Failed to import video');
      }

      const result = await response.json();
      
      toast.success('🎉 OnForm video linked!', {
        description: 'Video imported from share link. Ready to analyze.',
        duration: 4000
      });

      if (onImported && result.video) {
        onImported({
          videoId: result.video.id,
          athleteId: result.video.userId,
          sessionId: sessionId,
          video: result.video
        });
      }

      // Reset and close
      setVideoFile(null);
      setOnformUrl('');
      setVideoType('');
      setCameraAngle('side');
      onOpenChange(false);

    } catch (error) {
      console.error('Error importing OnForm link:', error);
      
      // Handle specific error types
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out', {
          description: 'The import took too long. This might be a network issue. Please check your connection and try again.',
          duration: 6000
        });
      } else {
        toast.error('Failed to import video link', {
          description: error instanceof Error ? error.message : 'Please verify the link and try again',
          duration: 5000
        });
      }
    } finally {
      setImporting(false);
    }
  };

  const handleOpenOnForm = () => {
    // iOS Safari deep link guidance
    // Note: OnForm doesn't have a registered universal link or custom URL scheme
    // that works reliably in Safari. The best approach is to guide users.
    
    toast.info('📱 Please Open OnForm Manually', {
      description: 'Tap the OnForm icon on your home screen to launch the app',
      duration: 6000
    });

    // Optionally try to open App Store if OnForm isn't installed
    // This is more reliable than broken deep links
    const appStoreUrl = 'https://apps.apple.com/app/onform-video-analysis/id1490456997';
    
    // Show App Store option after a delay
    setTimeout(() => {
      if (confirm('OnForm not installed? Open App Store to download?')) {
        window.open(appStoreUrl, '_blank');
      }
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#F5A623]">
            <Camera className="w-6 h-6" />
            Import from OnForm
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            High-quality video capture with OnForm's professional camera system
          </DialogDescription>
        </DialogHeader>

        {showInstructions ? (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                How to Record with OnForm
              </h3>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Open OnForm App</p>
                    <p className="text-gray-400">Launch OnForm on your iPhone or iPad</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Record the Swing</p>
                    <p className="text-gray-400">Use OnForm's high-FPS camera (120-240 FPS recommended)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Export the Video</p>
                    <p className="text-gray-400">Tap Share → Save to Photos OR Copy Share Link</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Import to BARRELS</p>
                    <p className="text-gray-400">Upload the file or paste the link below</p>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-900/30 border-blue-700 mt-4">
                <Info className="w-4 h-4 text-blue-400" />
                <AlertDescription className="text-sm text-gray-300">
                  <strong>Tip:</strong> After recording in OnForm, use "Share → Save to Photos" 
                  for best results. This gives you a full-quality file to upload.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleOpenOnForm}
                  variant="outline"
                  className="flex-1 border-gray-600 hover:bg-gray-800"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Need OnForm App?
                </Button>
                <Button
                  onClick={() => setShowInstructions(false)}
                  className="flex-1 bg-[#F5A623] hover:bg-[#E89815]"
                >
                  Next: Import Video
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setShowInstructions(true)}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to Instructions
            </Button>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">
                Choose Import Method
              </h3>
              <Tabs value={importMethod} onValueChange={(v) => setImportMethod(v as 'file' | 'link')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-800 h-12 p-1">
                  <TabsTrigger 
                    value="file"
                    className="data-[state=active]:bg-[#F5A623] data-[state=active]:text-white text-base"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload File (for analysis)
                  </TabsTrigger>
                  <TabsTrigger 
                    value="link"
                    className="data-[state=active]:bg-[#F5A623] data-[state=active]:text-white text-base"
                  >
                    <Link2 className="w-5 h-5 mr-2" />
                    OnForm Link (view-only)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="video-file" className="text-sm font-medium text-gray-300 mb-2 block">
                    OnForm Video File
                  </Label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#F5A623] transition-colors">
                    <Input
                      id="video-file"
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="video-file" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                      {videoFile ? (
                        <div>
                          <p className="text-white font-medium">{videoFile.name}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white mb-1">Click to select video</p>
                          <p className="text-sm text-gray-400">From Photos or Files app</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                </TabsContent>

                <TabsContent value="link" className="space-y-4 mt-4">
                  {/* Warning Alert - View-Only Limitation */}
                  <Alert className="bg-blue-500/10 border-blue-500/30">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200 text-sm">
                      <strong className="block mb-1">OnForm links are for view-only reference.</strong>
                      <p className="text-xs text-blue-300/80">
                        To run BARRELS analysis, export the video from OnForm and use the <strong>Upload File</strong> tab.
                      </p>
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label htmlFor="onform-url" className="text-sm font-medium text-gray-300 mb-2 block">
                      OnForm Share Link
                    </Label>
                    <Input
                      id="onform-url"
                      type="url"
                      value={onformUrl}
                      onChange={(e) => setOnformUrl(e.target.value)}
                      placeholder="https://onform.com/share/..."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Paste the share link from OnForm's export menu
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Common Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-type" className="text-sm font-medium text-gray-300 mb-2 block">
                  Video Type *
                </Label>
                <Select value={videoType} onValueChange={setVideoType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select video type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {VIDEO_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="camera-angle" className="text-sm font-medium text-gray-300 mb-2 block">
                  Camera Angle
                </Label>
                <Select value={cameraAngle} onValueChange={setCameraAngle}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="side">Side View</SelectItem>
                    <SelectItem value="face-on">Face-On View</SelectItem>
                    <SelectItem value="overhead">Overhead View</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Side view recommended for optimal 4Bs analysis
                </p>
              </div>
            </div>

            {/* Upload Progress Indicator */}
            {importing && importMethod === 'file' && uploadProgress > 0 && (
              <Card className="bg-gray-800/50 border-gray-700 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-gray-300">Uploading to BARRELS...</span>
                  </div>
                  <span className="text-[#F5A623] font-medium">{uploadProgress}%</span>
                </div>
                
                <Progress value={uploadProgress} className="h-2 bg-gray-700" />
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{uploadedMB.toFixed(1)} MB / {totalMB.toFixed(1)} MB</span>
                  <span>{videoFile?.name}</span>
                </div>
              </Card>
            )}

            <Button
              onClick={importMethod === 'file' ? handleFileImport : handleLinkImport}
              disabled={importing || (importMethod === 'file' ? !videoFile : !onformUrl.trim()) || !videoType}
              className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {importMethod === 'file' && uploadProgress > 0 
                    ? `Uploading ${uploadProgress}%...` 
                    : 'Importing...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import to BARRELS
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
