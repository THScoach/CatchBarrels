'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Target } from 'lucide-react'
import { toast } from 'sonner'

interface NewLessonModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewLessonModal({ isOpen, onClose }: NewLessonModalProps) {
  const router = useRouter()
  const [videoType, setVideoType] = useState<string>('swing')
  const [lessonFocus, setLessonFocus] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleStartLesson = async () => {
    if (!lessonFocus.trim()) {
      toast.error('Please enter what you\'re working on today')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoType,
          lessonFocus: lessonFocus.trim(),
          sessionName: `${videoType.charAt(0).toUpperCase() + videoType.slice(1)} Lesson - ${new Date().toLocaleDateString()}`
        })
      })

      if (!response.ok) throw new Error('Failed to create lesson')

      const data = await response.json()
      toast.success('Lesson started!')
      
      // Navigate to upload page with sessionId
      router.push(`/video/upload?sessionId=${data.id}`)
      onClose()
    } catch (error) {
      console.error('Error creating lesson:', error)
      toast.error('Failed to start lesson')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-500" />
            Start New Lesson
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set your focus for today's session. What are you working on?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="video-type" className="text-white font-medium">
              Video Type
            </Label>
            <Select value={videoType} onValueChange={setVideoType}>
              <SelectTrigger id="video-type" className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select video type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="swing">Swing</SelectItem>
                <SelectItem value="drill">Drill</SelectItem>
                <SelectItem value="tee">Tee Work</SelectItem>
                <SelectItem value="bp">Batting Practice</SelectItem>
                <SelectItem value="live">Live At-Bats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-focus" className="text-white font-medium">
              What are you working on today?
            </Label>
            <Textarea
              id="lesson-focus"
              placeholder="Example: Staying connected through impact, improving hip rotation, better timing on breaking balls..."
              value={lessonFocus}
              onChange={(e) => setLessonFocus(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white min-h-[120px] resize-none"
            />
            <p className="text-xs text-gray-500">
              This helps Coach Rick give you better feedback throughout your lesson
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartLesson}
            disabled={isCreating || !lessonFocus.trim()}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Lesson'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
