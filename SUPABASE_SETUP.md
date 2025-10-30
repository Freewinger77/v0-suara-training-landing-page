# Supabase Setup - Audio Training App

## ✅ Completed Setup

### 1. Database Schema Created
Successfully created and migrated to Supabase with the following:

#### Tables:
- **`users`** - Stores user information
  - `id` (UUID, primary key)
  - `email` (varchar, unique)
  - `privy_id` (varchar, unique) - Privy authentication ID
  - `region` (varchar) - Selected Malaysian region
  - `total_earnings` (decimal) - Accumulated points/earnings
  - `created_at`, `updated_at` (timestamps)

- **`training_submissions`** - Stores voice training submissions
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to users)
  - `original_text` (text) - AI generated text
  - `corrected_text` (text) - User corrected text
  - `audio_url` (text) - URL to audio file in Supabase Storage
  - `region` (varchar) - Region of submission
  - `earnings` (decimal) - Points earned (default 0.10)
  - `submitted_at` (timestamp)

#### Storage:
- **`audio-submissions`** bucket - Public storage for audio files
  - Organized by user ID and submission ID
  - Supports webm, mp3, and other audio formats

#### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Secure storage policies configured
- ✅ Functions have secure search_path settings

### 2. Migrations Applied
Three migrations have been successfully applied:
1. `create_initial_schema` - Created users and training_submissions tables
2. `add_increment_earnings_function` - Added function to update user earnings
3. `add_rls_policies` - Added Row Level Security policies

### 3. Project Configuration
- **Project Name**: mysuara
- **Project ID**: ipgszcciuxqssikcbrfk
- **Region**: ap-southeast-1
- **URL**: https://ipgszcciuxqssikcbrfk.supabase.co

Environment variables are already configured in `.env.local`.

## How It Works

### Audio Submission Flow:
1. **User Authentication**: User logs in with Privy
2. **User Creation**: API creates or retrieves user record in Supabase
3. **Training Session**: 
   - User receives AI-generated text
   - User corrects the text
   - User records audio
4. **Submission**:
   - Audio blob is uploaded to Supabase Storage
   - Submission record created with audio URL
   - User earnings automatically incremented
5. **History**: User can view all their past submissions

### API Endpoints:

#### `/api/users`
- **POST**: Create or get user by email
  ```json
  {
    "email": "user@example.com",
    "privyId": "privy_user_id",
    "region": "Kuala Lumpur"
  }
  ```
- **GET**: Get user by email
  - Query param: `email=user@example.com`

#### `/api/submissions`
- **POST**: Create new submission with audio
  ```json
  {
    "userId": "uuid",
    "originalText": "Original AI text",
    "correctedText": "User corrected text",
    "audioData": "data:audio/webm;base64,...",
    "region": "Selangor"
  }
  ```
- **GET**: Get user submissions
  - Query param: `userId=uuid`
  - Returns: `{ submissions: [], totalEarnings: 0 }`

### Frontend Integration:
- ✅ Training page now uses Supabase API
- ✅ Falls back to localStorage if user not authenticated
- ✅ Audio recordings uploaded to Supabase Storage
- ✅ Submissions and earnings synced with database

## Testing

The integration has been tested with:
- ✅ User creation
- ✅ Submission with audio URL
- ✅ Earnings increment function
- ✅ Security policies
- ✅ Storage bucket configuration

## Next Steps

To test the full flow:
1. Start the dev server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Sign in with Privy authentication
4. Select a region
5. Complete a training submission with audio
6. Check the Supabase dashboard to see the data

## Supabase Dashboard
View your data at: https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk

### Quick Links:
- **Table Editor**: View users and submissions
- **Storage**: View uploaded audio files
- **Logs**: Debug API calls
- **SQL Editor**: Run custom queries

## Files Created/Modified

### New Files:
- `lib/supabase.ts` - Supabase client configuration
- `lib/supabase-storage.ts` - Audio upload/download helpers
- `SUPABASE_SETUP.md` - This documentation

### Modified Files:
- `app/api/users/route.ts` - User management API
- `app/api/submissions/route.ts` - Submission handling with audio
- `app/training/page.tsx` - Frontend integration with Supabase
- `env.template` - Added Supabase configuration
- `package.json` - Added @supabase/supabase-js

## Troubleshooting

### Audio Upload Issues
If audio uploads fail, check:
1. Storage bucket exists and is public
2. File size limits (default 50MB)
3. Network connectivity
4. Browser console for errors

### Database Connection Issues
If database operations fail, verify:
1. Environment variables in `.env.local`
2. Supabase project is active
3. API keys are valid
4. RLS policies are not blocking operations

## Database Functions

### `increment_user_earnings(user_id UUID, amount DECIMAL)`
Safely increments a user's total earnings.

Example:
```sql
SELECT increment_user_earnings('user-uuid-here'::UUID, 0.10);
```

## Security Notes

- ✅ RLS enabled on all tables
- ✅ Storage policies restrict operations appropriately
- ✅ Audio files are public (can be accessed by URL)
- ✅ API validates user data before database operations
- ⚠️ Consider adding rate limiting for production
- ⚠️ Consider adding file type validation for audio uploads

