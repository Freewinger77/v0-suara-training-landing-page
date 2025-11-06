/**
 * State-to-Batch Starting Point Mapping
 * 
 * Each of Malaysia's 16 states/territories starts at a different batch
 * to ensure even distribution of data collection across all stories.
 * 
 * After completing their starting batch, users continue through the remaining
 * batches in sequence until all 280 stories are completed.
 * 
 * Example: Penang starts at Batch 9
 * → Stories 249-280 (Batch 9)
 * → Stories 1-31 (Batch 1)
 * → Stories 32-62 (Batch 2)
 * → ... continues until all batches complete
 */

export const STATE_BATCH_MAPPING: Record<string, number> = {
  // Batch 1 starters (Stories 1-31)
  "Johor": 1,
  "Perak": 1,
  
  // Batch 2 starters (Stories 32-62)
  "Kedah": 2,
  "Perlis": 2,
  
  // Batch 3 starters (Stories 63-93)
  "Kelantan": 3,
  "Putrajaya": 3,
  
  // Batch 4 starters (Stories 94-124)
  "Kuala Lumpur": 4,
  "Sabah": 4,
  
  // Batch 5 starters (Stories 125-155)
  "Labuan": 5,
  "Sarawak": 5,
  
  // Batch 6 starters (Stories 156-186)
  "Melaka": 6,
  "Selangor": 6,
  
  // Batch 7 starters (Stories 187-217)
  "Negeri Sembilan": 7,
  "Terengganu": 7,
  
  // Batch 8 starters (Stories 218-248)
  "Pahang": 8,
  
  // Batch 9 starters (Stories 249-280)
  "Penang": 9,
}

/**
 * Get the starting batch number for a given state/region
 * Returns 1 if region is not found (default to Batch 1)
 */
export function getStartingBatch(region: string | null | undefined): number {
  if (!region) return 1
  
  // Normalize region name (handle case variations)
  const normalizedRegion = Object.keys(STATE_BATCH_MAPPING).find(
    key => key.toLowerCase() === region.toLowerCase()
  )
  
  return normalizedRegion ? STATE_BATCH_MAPPING[normalizedRegion] : 1
}

/**
 * Create a batch sequence starting from the given batch number
 * Example: startingBatch = 9 → [9, 1, 2, 3, 4, 5, 6, 7, 8]
 */
export function createBatchSequence(startingBatch: number): number[] {
  const sequence: number[] = []
  
  // Start from the starting batch
  for (let i = startingBatch; i <= 9; i++) {
    sequence.push(i)
  }
  
  // Continue from batch 1 to the batch before starting batch
  for (let i = 1; i < startingBatch; i++) {
    sequence.push(i)
  }
  
  return sequence
}

/**
 * Get the story ID ranges for each batch
 */
export const BATCH_RANGES: Record<number, { start: number; end: number; count: number }> = {
  1: { start: 1, end: 31, count: 31 },
  2: { start: 32, end: 62, count: 31 },
  3: { start: 63, end: 93, count: 31 },
  4: { start: 94, end: 124, count: 31 },
  5: { start: 125, end: 155, count: 31 },
  6: { start: 156, end: 186, count: 31 },
  7: { start: 187, end: 217, count: 31 },
  8: { start: 218, end: 248, count: 31 },
  9: { start: 249, end: 280, count: 32 }, // Batch 9 has 32 stories
}

/**
 * Check if a story ID belongs to a specific batch
 */
export function isStoryInBatch(storyId: number, batchNumber: number): boolean {
  const range = BATCH_RANGES[batchNumber]
  if (!range) return false
  return storyId >= range.start && storyId <= range.end
}

/**
 * Get batch number for a given story ID
 */
export function getBatchForStory(storyId: number): number | null {
  for (const [batchNum, range] of Object.entries(BATCH_RANGES)) {
    if (storyId >= range.start && storyId <= range.end) {
      return parseInt(batchNum)
    }
  }
  return null
}

