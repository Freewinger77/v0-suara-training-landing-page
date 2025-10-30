import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { uploadAudioToStorage, dataUrlToBlob } from '@/lib/supabase-storage'

export async function POST(request: Request) {
  try {
    const { userId, originalText, correctedText, region, audioData } = await request.json()

    if (!userId || !originalText || !correctedText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let audioUrl: string | undefined

    // Upload audio if provided
    if (audioData) {
      try {
        // Convert base64 data URL to Blob
        const audioBlob = dataUrlToBlob(audioData)
        
        // Generate a unique submission ID for the filename
        const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`
        
        // Upload to Supabase Storage
        audioUrl = await uploadAudioToStorage(audioBlob, userId, submissionId)
      } catch (uploadError) {
        console.error('Error uploading audio:', uploadError)
        // Continue without audio URL - we don't want to fail the entire submission
      }
    }

    // Create submission in database
    const earnings = 0.1
    const { data: submission, error: submissionError } = await supabase
      .from('training_submissions')
      .insert({
        user_id: userId,
        original_text: originalText,
        corrected_text: correctedText,
        audio_url: audioUrl,
        region,
        earnings,
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Error creating submission:', submissionError)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
    }

    // Update user's total earnings
    const { error: earningsError } = await supabase.rpc('increment_user_earnings', {
      user_id_input: userId,
      amount: earnings,
    })

    // If RPC doesn't exist, update directly
    if (earningsError && earningsError.code === '42883') {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_earnings: supabase.raw(`total_earnings + ${earnings}`),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating earnings:', updateError)
      }
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data: submissions, error } = await supabase
      .from('training_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    // Also get user's total earnings
    const { data: user } = await supabase
      .from('users')
      .select('total_earnings')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      submissions,
      totalEarnings: user?.total_earnings || 0,
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
