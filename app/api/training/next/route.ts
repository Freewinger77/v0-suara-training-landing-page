import { NextResponse } from "next/server"
import { getNextStoryForRegion, getTotalStoryCount, allStories } from "@/lib/training-texts"
import { supabase } from "@/lib/supabase"
import { getStartingBatch } from "@/lib/state-batch-mapping"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const region = searchParams.get('region')

    if (!userId) {
      // If no userId, return the first story based on region
      const completedStoryIds: number[] = []
      const firstStory = getNextStoryForRegion(region, completedStoryIds)
      
      if (!firstStory) {
        return NextResponse.json({ error: "No stories available" }, { status: 404 })
      }
      
      const startingBatch = getStartingBatch(region)
      console.log('👤 New user from region:', region, '→ Starting at Batch', startingBatch)
      
      return NextResponse.json({
        text: firstStory.content,
        storyId: firstStory.id,
        title: firstStory.title,
        totalStories: getTotalStoryCount(),
        currentStory: 1
      })
    }

    // Get user's region from database if not provided in query
    let userRegion = region
    if (!userRegion) {
      const { data: userData } = await supabase
        .from('users')
        .select('region')
        .eq('id', userId)
        .single()
      
      userRegion = userData?.region || null
    }

    // Get user's completed story IDs from their submissions
    const { data: submissions, error } = await supabase
      .from('training_submissions')
      .select('story_id')
      .eq('user_id', userId)
      .not('story_id', 'is', null)

    if (error) {
      console.error('Error fetching submissions:', error)
      // Continue anyway - return first story for this region
      const firstStory = getNextStoryForRegion(userRegion, [])
      const startingBatch = getStartingBatch(userRegion)
      
      return NextResponse.json({
        text: firstStory?.content || allStories[0].content,
        storyId: firstStory?.id || allStories[0].id,
        title: firstStory?.title || allStories[0].title,
        totalStories: getTotalStoryCount(),
        currentStory: 1
      })
    }

    // Get array of completed story IDs
    const completedStoryIds = submissions?.map(s => s.story_id).filter(id => id !== null) || []
    console.log('📊 User from', userRegion, 'has completed', completedStoryIds.length, 'stories')

    // Get the next uncompleted story based on region
    const nextStory = getNextStoryForRegion(userRegion, completedStoryIds)

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
    const startingBatch = getStartingBatch(userRegion)

    console.log('📖 Next story for region', userRegion, '(starts Batch', startingBatch + '):', {
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
