import { batch1Stories } from './batch-1'
import { batch2Stories } from './batch-2'
import { batch3Stories } from './batch-3'
import { batch4Stories } from './batch-4'
import { batch5Stories } from './batch-5'
import { batch6Stories } from './batch-6'
import { batch7Stories } from './batch-7'
import { batch8Stories } from './batch-8'
import { batch9Stories } from './batch-9'
import { getStartingBatch, createBatchSequence, isStoryInBatch } from '../state-batch-mapping'

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

// Map batch numbers to their story arrays
const batchMap: Record<number, TrainingStory[]> = {
  1: batch1Stories,
  2: batch2Stories,
  3: batch3Stories,
  4: batch4Stories,
  5: batch5Stories,
  6: batch6Stories,
  7: batch7Stories,
  8: batch8Stories,
  9: batch9Stories,
}

// Get story by ID
export function getStoryById(id: number): TrainingStory | undefined {
  return allStories.find(story => story.id === id)
}

// Get stories for a specific batch
export function getStoriesInBatch(batchNumber: number): TrainingStory[] {
  return batchMap[batchNumber] || []
}

// Get the next story in sequence for a user (legacy - no region)
// Returns the first story they haven't completed yet
export function getNextStory(completedStoryIds: number[]): TrainingStory | null {
  // Find the first story that hasn't been completed
  const nextStory = allStories.find(story => !completedStoryIds.includes(story.id))
  return nextStory || null
}

/**
 * Get the next story for a user based on their region
 * Users from different regions start at different batches for even distribution
 * 
 * @param region - User's selected region (state)
 * @param completedStoryIds - Array of story IDs the user has already completed
 * @returns The next story to complete, or null if all stories are done
 */
export function getNextStoryForRegion(
  region: string | null | undefined,
  completedStoryIds: number[]
): TrainingStory | null {
  // Get the starting batch for this region
  const startingBatch = getStartingBatch(region)
  
  // Create the batch sequence for this region
  // Example: Penang (batch 9) → [9, 1, 2, 3, 4, 5, 6, 7, 8]
  const batchSequence = createBatchSequence(startingBatch)
  
  // Loop through batches in the region's sequence
  for (const batchNumber of batchSequence) {
    const batchStories = getStoriesInBatch(batchNumber)
    
    // Find the first uncompleted story in this batch
    const nextStory = batchStories.find(
      story => !completedStoryIds.includes(story.id)
    )
    
    if (nextStory) {
      // Found the next story for this user!
      return nextStory
    }
    
    // This batch is complete, continue to next batch in sequence
  }
  
  // All 280 stories completed!
  return null
}

// Get total number of stories
export function getTotalStoryCount(): number {
  return allStories.length
}

