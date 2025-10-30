import { supabase, AUDIO_BUCKET } from './supabase'

/**
 * Upload an audio blob to Supabase Storage
 * @param audioBlob - The audio blob to upload
 * @param userId - The user ID for organizing files
 * @param submissionId - Unique submission ID for the filename
 * @returns The public URL of the uploaded audio file
 */
export async function uploadAudioToStorage(
  audioBlob: Blob,
  userId: string,
  submissionId: string
): Promise<string> {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const filename = `${userId}/${submissionId}_${timestamp}.webm`

    // Upload the audio file
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filename, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading audio:', error)
      throw new Error(`Failed to upload audio: ${error.message}`)
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error in uploadAudioToStorage:', error)
    throw error
  }
}

/**
 * Delete an audio file from Supabase Storage
 * @param audioUrl - The public URL of the audio file to delete
 */
export async function deleteAudioFromStorage(audioUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const urlObj = new URL(audioUrl)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/audio-submissions\/(.+)/)
    
    if (!pathMatch) {
      console.error('Could not extract path from audio URL:', audioUrl)
      return
    }

    const filePath = pathMatch[1]

    const { error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Error deleting audio:', error)
      throw new Error(`Failed to delete audio: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteAudioFromStorage:', error)
    throw error
  }
}

/**
 * Convert a base64 data URL to a Blob
 * @param dataUrl - The base64 data URL
 * @returns Blob object
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'audio/webm'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

