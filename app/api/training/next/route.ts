import { NextResponse } from "next/server"
import { getNextStory, getTotalStoryCount, allStories } from "@/lib/training-texts"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      // If no userId, return the first story
      const firstStory = allStories[0]
      if (!firstStory) {
        return NextResponse.json({ error: "No stories available" }, { status: 404 })
      }
      return NextResponse.json({
        text: firstStory.content,
        storyId: firstStory.id,
        title: firstStory.title,
        totalStories: getTotalStoryCount(),
        currentStory: 1
      })
    }

    // Get user's completed story IDs from their submissions
    const { data: submissions, error } = await supabase
      .from('training_submissions')
      .select('story_id')
      .eq('user_id', userId)
      .not('story_id', 'is', null)

    if (error) {
      console.error('Error fetching submissions:', error)
      // Continue anyway - return first story
      const firstStory = allStories[0]
      return NextResponse.json({
        text: firstStory.content,
        storyId: firstStory.id,
        title: firstStory.title,
        totalStories: getTotalStoryCount(),
        currentStory: 1
      })
    }

    // Get array of completed story IDs
    const completedStoryIds = submissions?.map(s => s.story_id).filter(id => id !== null) || []
    console.log('📊 User completed stories:', completedStoryIds.length, 'stories')

    // Get the next uncompleted story
    const nextStory = getNextStory(completedStoryIds)

    if (!nextStory) {
      // User has completed all stories
      return NextResponse.json({
        text: null,
        storyId: null,
        title: null,
        completed: true,
        totalStories: getTotalStoryCount(),
        message: "You have completed all available stories! 🎉"
      })
    }

    // Calculate current story number (completed + 1)
    const currentStoryNumber = completedStoryIds.length + 1

    console.log('📖 Next story:', {
      storyId: nextStory.id,
      title: nextStory.title,
      currentStory: currentStoryNumber,
      totalStories: getTotalStoryCount()
    })

    return NextResponse.json({
      text: nextStory.content,
      storyId: nextStory.id,
      title: nextStory.title,
      totalStories: getTotalStoryCount(),
      currentStory: currentStoryNumber
    })
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
