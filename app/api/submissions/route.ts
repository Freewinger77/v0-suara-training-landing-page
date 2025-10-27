import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, originalText, correctedText, region, audioUrl } = await request.json()

    if (!email || !originalText || !correctedText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create submission
    const submission = await db.createSubmission(user.id, originalText, correctedText, region, audioUrl)

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const submissions = await db.getSubmissionsByUser(user.id)
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
