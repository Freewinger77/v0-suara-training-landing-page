// Simple in-memory database for local development
// This will be replaced with a real database later

export interface User {
  id: number
  email: string
  region?: string
  totalEarnings: number
  createdAt: Date
  updatedAt: Date
}

export interface TrainingSubmission {
  id: number
  userId: number
  originalText: string
  correctedText: string
  audioUrl?: string
  region?: string
  earnings: number
  submittedAt: Date
}

class LocalDatabase {
  private users: Map<number, User> = new Map()
  private submissions: Map<number, TrainingSubmission> = new Map()
  private userIdCounter = 1
  private submissionIdCounter = 1

  // User operations
  async createUser(email: string, region?: string): Promise<User> {
    const existingUser = Array.from(this.users.values()).find((u) => u.email === email)
    if (existingUser) return existingUser

    const user: User = {
      id: this.userIdCounter++,
      email,
      region,
      totalEarnings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(user.id, user)
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find((u) => u.email === email)
    return user || null
  }

  async updateUserRegion(userId: number, region: string): Promise<User | null> {
    const user = this.users.get(userId)
    if (!user) return null

    user.region = region
    user.updatedAt = new Date()
    this.users.set(userId, user)
    return user
  }

  async updateUserEarnings(userId: number, amount: number): Promise<User | null> {
    const user = this.users.get(userId)
    if (!user) return null

    user.totalEarnings += amount
    user.updatedAt = new Date()
    this.users.set(userId, user)
    return user
  }

  // Submission operations
  async createSubmission(
    userId: number,
    originalText: string,
    correctedText: string,
    region?: string,
    audioUrl?: string, // Added audio URL parameter
  ): Promise<TrainingSubmission> {
    const submission: TrainingSubmission = {
      id: this.submissionIdCounter++,
      userId,
      originalText,
      correctedText,
      region,
      audioUrl, // Store audio URL
      earnings: 0.1,
      submittedAt: new Date(),
    }
    this.submissions.set(submission.id, submission)

    // Update user earnings
    await this.updateUserEarnings(userId, 0.1)

    return submission
  }

  async getSubmissionsByUser(userId: number): Promise<TrainingSubmission[]> {
    return Array.from(this.submissions.values()).filter((s) => s.userId === userId)
  }

  async getSubmissionsByRegion(region: string): Promise<TrainingSubmission[]> {
    return Array.from(this.submissions.values()).filter((s) => s.region === region)
  }
}

// Singleton instance
export const db = new LocalDatabase()
