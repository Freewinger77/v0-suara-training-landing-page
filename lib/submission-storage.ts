export interface StoredSubmission {
  id: string
  timestamp: number
  originalText: string
  correctedText: string
  audioData: string | null // base64 encoded audio
  region: string
  earnings: number
}

const MAX_SUBMISSIONS = 10
const STORAGE_KEY = "suara_submissions"
const EARNINGS_KEY = "suara_total_earnings"

export function saveSubmission(submission: Omit<StoredSubmission, "id" | "timestamp">): void {
  try {
    const submissions = getSubmissions()
    const newSubmission: StoredSubmission = {
      ...submission,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }

    // Add to beginning of array
    submissions.unshift(newSubmission)

    // Keep only last 10
    const trimmed = submissions.slice(0, MAX_SUBMISSIONS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

    // Update earnings
    const currentEarnings = getTotalEarnings()
    localStorage.setItem(EARNINGS_KEY, (currentEarnings + submission.earnings).toFixed(2))
  } catch (error) {
    console.error("Error saving submission:", error)
  }
}

export function getSubmissions(): StoredSubmission[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error getting submissions:", error)
    return []
  }
}

export function getTotalEarnings(): number {
  try {
    const stored = localStorage.getItem(EARNINGS_KEY)
    return stored ? Number.parseFloat(stored) : 0
  } catch (error) {
    console.error("Error getting earnings:", error)
    return 0
  }
}

export function deleteSubmission(id: string): void {
  try {
    const submissions = getSubmissions()
    const filtered = submissions.filter((s) => s.id !== id)

    // Find the deleted submission to subtract its earnings
    const deleted = submissions.find((s) => s.id === id)
    if (deleted) {
      const currentEarnings = getTotalEarnings()
      const newEarnings = Math.max(0, currentEarnings - deleted.earnings)
      localStorage.setItem(EARNINGS_KEY, newEarnings.toFixed(2))
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting submission:", error)
  }
}

export function clearSubmissions(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(EARNINGS_KEY)
}
