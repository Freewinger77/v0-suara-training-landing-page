import { batch1Stories } from './batch-1'
import { batch2Stories } from './batch-2'
import { batch3Stories } from './batch-3'
import { batch4Stories } from './batch-4'
import { batch5Stories } from './batch-5'
import { batch6Stories } from './batch-6'
import { batch7Stories } from './batch-7'
import { batch8Stories } from './batch-8'
import { batch9Stories } from './batch-9'

export type TrainingStory = {
  id: number
  title: string
  content: string
}

// Combine all batches into a single array (280 stories total)
export const allStories: TrainingStory[] = [
  ...batch1Stories,  // IDs 1-31
  ...batch2Stories,  // IDs 32-62
  ...batch3Stories,  // IDs 63-93
  ...batch4Stories,  // IDs 94-124
  ...batch5Stories,  // IDs 125-155
  ...batch6Stories,  // IDs 156-186
  ...batch7Stories,  // IDs 187-217
  ...batch8Stories,  // IDs 218-248
  ...batch9Stories,  // IDs 249-280
]

// Get story by ID
export function getStoryById(id: number): TrainingStory | undefined {
  return allStories.find(story => story.id === id)
}

// Get the next story in sequence for a user
// Returns the first story they haven't completed yet
export function getNextStory(completedStoryIds: number[]): TrainingStory | null {
  // Find the first story that hasn't been completed
  const nextStory = allStories.find(story => !completedStoryIds.includes(story.id))
  return nextStory || null
}

// Get total number of stories
export function getTotalStoryCount(): number {
  return allStories.length
}

