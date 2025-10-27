import { NextResponse } from "next/server"
import { getRandomText } from "@/lib/sample-texts"

export async function GET() {
  try {
    // In production, this would call your streaming endpoint
    // For now, return a random sample text
    const text = getRandomText()

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error fetching next text:", error)
    return NextResponse.json({ error: "Failed to fetch text" }, { status: 500 })
  }
}

// For future streaming implementation
export async function POST(request: Request) {
  try {
    const { endpoint } = await request.json()

    // This is where you would call your custom streaming endpoint
    // const response = await fetch(endpoint)
    // return new Response(response.body, {
    //   headers: {
    //     'Content-Type': 'text/event-stream',
    //     'Cache-Control': 'no-cache',
    //     'Connection': 'keep-alive',
    //   },
    // })

    return NextResponse.json({ message: "Streaming endpoint not configured" })
  } catch (error) {
    console.error("Error with streaming:", error)
    return NextResponse.json({ error: "Streaming failed" }, { status: 500 })
  }
}
