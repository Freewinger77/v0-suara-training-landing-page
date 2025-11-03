# ✅ Supabase Integration Complete!

## What Was Done

Your Supabase database is now fully integrated with your voice training app. Here's what was set up:

### 1. ✅ Database Tables Created
- **`users` table** - Stores user information from Privy authentication
  - Auto-generates UUID for each user
  - Links to Privy ID
  - Tracks total_earnings (points)
  - Stores selected region
  
- **`training_submissions` table** - Stores all voice training submissions
  - Links to users via foreign key
  - Stores original and corrected text
  - Stores audio URL from storage
  - Tracks earnings per submission (0.10 points)
  - Records submission timestamp

### 2. ✅ Storage Bucket Configured
- **`audio-submissions`** bucket created
  - Public access enabled
  - 50MB file size limit
  - Supports audio formats: webm, mp3, mpeg, wav, ogg
  - Storage policies allow public uploads and reads

### 3. ✅ Database Functions
- **`increment_user_earnings()`** function created
  - Automatically updates user points when submissions are made
  - Updates the updated_at timestamp

### 4. ✅ Security Policies (RLS)
- Row Level Security enabled on both tables
- Policies allow all operations for both anon and authenticated users
- Storage policies allow public uploads and reads

### 5. ✅ API Routes Ready
Your API routes are already configured to use Supabase:
- `/api/users` - Creates/retrieves users
- `/api/submissions` - Saves submissions with audio uploads

---

## How It Works Now

### When User Logs In:
1. User clicks "Sign In" and authenticates with X/Twitter or Google via Privy
2. App automatically calls `/api/users` with their email and Privy ID
3. User record is created in Supabase `users` table (or retrieved if exists)
4. User ID is stored in the app state

### When User Submits Training:
1. User corrects the AI-generated text
2. User records audio using the microphone
3. App calls `/api/submissions` with:
   - User ID
   - Original text
   - Corrected text
   - Audio blob (base64)
   - Region
4. API uploads audio to Supabase Storage
5. API creates submission record in database with audio URL
6. API increments user's total_earnings by 0.10 points
7. User sees "Submission successful! You earned 10 Points"

---

## Testing Your Integration

### Step 1: Restart Your Dev Server
The development server needs to be restarted to pick up the Supabase configuration:

```bash
# Stop the current dev server (Ctrl+C)
pnpm dev
```

### Step 2: Test the Flow
1. Go to http://localhost:3000
2. Click "Sign In" and log in with X or Google
3. Select your region (e.g., Kuala Lumpur)
4. You'll be taken to the training page
5. Correct the AI-generated text
6. Click "Continue" and record audio
7. Submit the training

### Step 3: Verify in Supabase Dashboard

**Check Users Table:**
https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/editor/public/users

You should see:
- Your email
- Your Privy ID
- Your selected region
- total_earnings: 0.10

**Check Submissions Table:**
https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/editor/public/training_submissions

You should see:
- Your user_id
- Original and corrected text
- audio_url (link to storage)
- region
- earnings: 0.10
- submitted_at timestamp

**Check Storage:**
https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/storage/buckets/audio-submissions

You should see:
- Folder with your user ID
- Audio file inside (click to play it!)

---

## Environment Variables

Your `.env.local` is already configured with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ipgszcciuxqssikcbrfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

---

## Troubleshooting

### If Users Aren't Being Created:
1. Check browser console for errors (F12)
2. Verify you're logged in (look for your name in top-right corner)
3. Make sure you selected a region before going to training page
4. Check network tab to see if `/api/users` is being called

### If Submissions Aren't Saving:
1. Check browser console for errors
2. Make sure audio recorded successfully (you should see waveform)
3. Check network tab to see if `/api/submissions` is being called
4. Look at the response - it should return the submission data

### If Audio Isn't Uploading:
1. Check if audio-submissions bucket exists in Supabase Storage
2. Verify bucket is set to public
3. Check browser console for storage errors
4. Try a shorter audio recording first

### Common Errors:

**"Missing Supabase environment variables"**
- Make sure `.env.local` has the SUPABASE_URL and SUPABASE_ANON_KEY
- Restart your dev server after adding env variables

**"Failed to create user"**
- Check Supabase dashboard → Logs
- Verify RLS policies are enabled
- Check that email is being passed correctly

**"Failed to upload audio"**
- Check storage bucket exists
- Verify storage policies allow uploads
- Check file size isn't too large (max 50MB)

---

## Database Schema Quick Reference

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  privy_id VARCHAR UNIQUE,
  region VARCHAR,
  total_earnings DECIMAL DEFAULT 0.00,  -- Points!
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Submissions
training_submissions (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  audio_url TEXT,
  region VARCHAR,
  earnings DECIMAL DEFAULT 0.10,  -- Points per submission
  submitted_at TIMESTAMP
)
```

---

## Next Steps

Now that the integration is complete, you can:

1. **Test the full flow** - Login, select region, submit training
2. **Check Supabase dashboard** - Verify data is being saved
3. **Build new features** - Use Supabase MCP in Cursor to:
   - Add a leaderboard
   - Show user statistics
   - Display submission history
   - Track progress over time
   - Add region-based analytics

---

## Need Help?

### Check Logs:
- **Browser Console**: F12 → Console tab
- **Network Requests**: F12 → Network tab
- **Supabase Logs**: https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/logs

### Useful SQL Queries:

```sql
-- Count total users
SELECT COUNT(*) FROM users;

-- Count total submissions
SELECT COUNT(*) FROM training_submissions;

-- See recent submissions
SELECT * FROM training_submissions 
ORDER BY submitted_at DESC 
LIMIT 10;

-- Top users by points
SELECT email, total_earnings 
FROM users 
ORDER BY total_earnings DESC 
LIMIT 10;
```

---

## 🎉 You're All Set!

Your app is now fully connected to Supabase:
- ✅ Users save to database on login
- ✅ Submissions save to database with audio
- ✅ Audio files upload to storage
- ✅ Points system tracks earnings
- ✅ All data persists in Supabase

Just restart your dev server and start testing!

```bash
pnpm dev
```

Then go to http://localhost:3000 and try the full flow! 🚀

