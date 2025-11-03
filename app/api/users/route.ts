import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get or create a user by email
export async function POST(request: Request) {
  try {
    const { email, privyId, region } = await request.json()
    
    console.log('👤 [API] Creating/fetching user:', { email, privyId, region })

    if (!email) {
      console.error('❌ [API] Email is required')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Try to find existing user by email or privyId
    let query = supabase
      .from('users')
      .select('*')
      .eq('email', email)

    if (privyId) {
      query = query.or(`privy_id.eq.${privyId}`)
    }

    const { data: existingUsers, error: findError } = await query.limit(1).single()

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error finding user:', findError)
      return NextResponse.json({ error: 'Failed to find user' }, { status: 500 })
    }

    // If user exists, update and return
    if (existingUsers) {
      console.log('✅ [API] User found:', existingUsers.id)
      // Update privy_id or region if provided
      const updates: any = {}
      if (privyId && !existingUsers.privy_id) updates.privy_id = privyId
      if (region && region !== existingUsers.region) updates.region = region

      if (Object.keys(updates).length > 0) {
        console.log('📝 [API] Updating user:', updates)
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', existingUsers.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ [API] Error updating user:', updateError)
        } else {
          console.log('✅ [API] User updated')
          return NextResponse.json(updatedUser)
        }
      }

      return NextResponse.json(existingUsers)
    }

    // Create new user
    console.log('➕ [API] Creating new user...')
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        privy_id: privyId || null,
        region: region || null,
        total_earnings: 0,
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ [API] Error creating user:', createError)
      return NextResponse.json({ error: 'Failed to create user', details: createError }, { status: 500 })
    }

    console.log('✅ [API] User created:', newUser.id)
    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Error in user route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get user by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      console.error('Error fetching user:', error)
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in user GET route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
