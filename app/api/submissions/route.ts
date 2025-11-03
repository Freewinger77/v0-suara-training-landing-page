import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { uploadAudioToStorage, dataUrlToBlob } from '@/lib/supabase-storage'

export async function POST(request: Request) {
  try {
    const { userId, originalText, correctedText, region, audioData } = await request.json()
    
    console.log('🚀 [API] Submission request:', { 
      userId, 
      hasOriginalText: !!originalText,
      hasCorrectedText: !!correctedText,
      region,
      hasAudio: !!audioData 
    })

    if (!userId || !originalText || !correctedText) {
      console.error('❌ [API] Missing required fields')
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
        console.log('📤 [API] Uploading audio...')
        // Convert base64 data URL to Blob
        const audioBlob = dataUrlToBlob(audioData)
        console.log('📦 [API] Audio blob size:', audioBlob.size)
        
        // Generate a unique submission ID for the filename
        const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`
        
        // Upload to Supabase Storage
        audioUrl = await uploadAudioToStorage(audioBlob, userId, submissionId)
        console.log('✅ [API] Audio uploaded:', audioUrl)
      } catch (uploadError) {
        console.error('❌ [API] Error uploading audio:', uploadError)
        // Continue without audio URL - we don't want to fail the entire submission
      }
    }

    // Create submission in database
    console.log('💾 [API] Creating submission record...')
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
      console.error('❌ [API] Error creating submission:', submissionError)
      return NextResponse.json({ error: 'Failed to create submission', details: submissionError }, { status: 500 })
    }

    console.log('✅ [API] Submission created:', submission.id)

    // Update user's total earnings
    console.log('💰 [API] Updating user earnings...')
    const { error: earningsError } = await supabase.rpc('increment_user_earnings', {
      user_id_input: userId,
      amount: earnings,
    })

    if (earningsError) {
      console.error('❌ [API] Error updating earnings:', earningsError)
    } else {
      console.log('✅ [API] Earnings updated')
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    console.log('🗑️ [API] Deleting submission:', submissionId)

    // Get submission details before deleting
    const { data: submission, error: fetchError } = await supabase
      .from('training_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      console.error('❌ [API] Submission not found:', fetchError)
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Delete audio file from storage if it exists
    if (submission.audio_url) {
      try {
        console.log('🗑️ [API] Deleting audio file from storage...')
        const { deleteAudioFromStorage } = await import('@/lib/supabase-storage')
        await deleteAudioFromStorage(submission.audio_url)
        console.log('✅ [API] Audio file deleted')
      } catch (audioError) {
        console.error('❌ [API] Error deleting audio file:', audioError)
        // Continue with deletion even if audio deletion fails
      }
    }

    // Delete submission from database
    const { error: deleteError } = await supabase
      .from('training_submissions')
      .delete()
      .eq('id', submissionId)

    if (deleteError) {
      console.error('❌ [API] Error deleting submission:', deleteError)
      return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
    }

    // Decrement user's earnings
    console.log('💰 [API] Decrementing user earnings...')
    const { error: earningsError } = await supabase.rpc('increment_user_earnings', {
      user_id_input: submission.user_id,
      amount: -Number(submission.earnings),
    })

    if (earningsError) {
      console.error('❌ [API] Error updating earnings:', earningsError)
    } else {
      console.log('✅ [API] Earnings decremented')
    }

    console.log('✅ [API] Submission deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }
}
