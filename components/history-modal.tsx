"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { History, Play, Trash2, Loader2 } from "lucide-react"
import type { StoredSubmission } from "@/lib/submission-storage"
import { useToast } from "@/hooks/use-toast"

interface HistoryModalProps {
  submissions: StoredSubmission[]
  onDelete: () => void
}

export function HistoryModal({ submissions, onDelete }: HistoryModalProps) {
  const { toast } = useToast()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const playAudio = (audioData: string, id: string) => {
    if (!audioData) return

    try {
      const audio = new Audio(audioData)
      audio.onended = () => setPlayingId(null)
      audio.play()
      setPlayingId(id)
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/submissions?submissionId=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete submission')
      }

      // Show success toast
      toast({
        title: "Submission deleted",
        description: "Your submission has been successfully removed.",
      })

      // Call the onDelete callback to refresh the submissions list
      onDelete()
    } catch (error) {
      console.error('Error deleting submission:', error)
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete submission. Please try again.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="cursor-pointer h-10 w-10 p-0" 
          title="View submission history"
        >
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submission History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No submissions yet</p>
          ) : (
            submissions.map((submission, index) => (
              <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {submission.region && (
                      <img
                        src={`/images/flags/${submission.region.toLowerCase().replace(/\s+/g, "-")}.png`}
                        alt={`${submission.region} flag`}
                        className="w-5 h-4 object-cover rounded shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      Submission #{submissions.length - index}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.timestamp).toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(submission.id)}
                      disabled={deletingId === submission.id}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === submission.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Original:</p>
                    <p className="text-sm">{submission.originalText}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Corrected:</p>
                    <p className="text-sm">{submission.correctedText}</p>
                  </div>
                  {submission.audioData && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playAudio(submission.audioData!, submission.id)}
                        disabled={playingId === submission.id}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {playingId === submission.id ? "Playing..." : "Play Audio"}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">{submission.region}</span>
                  <span className="text-sm font-medium text-green-600">+ {submission.earnings*100} Points</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
