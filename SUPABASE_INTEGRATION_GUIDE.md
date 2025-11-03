# Supabase MCP Integration Guide

## Overview
Simple step-by-step guide to integrate your Supabase database with Cursor's MCP (Model Context Protocol) for AI-assisted development. This connects your voice training app's database so AI can help you build features faster.

## What This Does
- Connects Cursor AI to your Supabase database
- AI can read your database schema and help write queries
- AI can suggest migrations and fix database issues
- Makes development faster with intelligent suggestions

---

## Prerequisites
✅ You already have:
- Supabase project running (Project ID: ipgszcciuxqssikcbrfk)
- Privy authentication working

❌ You need to create:
- Database tables: `users` and `training_submissions`
- Audio storage bucket

**Don't worry!** This guide will help you create everything.

---

## Step 1: Get Your Supabase Credentials

### 1.1 Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/settings/api

### 1.2 Copy These Values:
- **Project URL**: `https://ipgszcciuxqssikcbrfk.supabase.co`
- **Anon Key**: (Find under "Project API keys" → "anon public")
- **Service Role Key**: (Find under "Project API keys" → "service_role") - ⚠️ Keep this secret!

---

## Step 2: Configure Cursor MCP

### 2.1 Open Cursor Settings
1. Open Cursor
2. Go to: **Settings** → **Features** → **MCP Servers**
3. Click "Edit Config" or "Configure MCP"

### 2.2 Add Supabase MCP Configuration
Add this to your MCP config:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://ipgszcciuxqssikcbrfk.supabase.co",
        "SUPABASE_ACCESS_TOKEN": "YOUR_SERVICE_ROLE_KEY_HERE"
      }
    }
  }
}
```

### 2.3 Replace YOUR_SERVICE_ROLE_KEY_HERE
Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the service role key from Step 1.2

### 2.4 Save and Restart
Save the config and restart Cursor.

---

## Step 3: Verify MCP Connection

### 3.1 Test in Cursor Chat
Open Cursor chat and ask:
```
List my Supabase projects
```

You should see your project: **mysuara** (ipgszcciuxqssikcbrfk)

---

## Step 4: Create Database Tables

Now use Cursor AI with MCP to create your tables!

### 4.1 Ask Cursor to Create Tables
Open Cursor chat and ask:

```
Create these tables in my Supabase database:

1. users table with:
   - id (UUID primary key, auto-generated)
   - email (varchar, unique, required)
   - privy_id (varchar, unique) 
   - region (varchar)
   - total_earnings (decimal, default 0.00)
   - created_at (timestamp, default now)
   - updated_at (timestamp, default now)

2. training_submissions table with:
   - id (UUID primary key, auto-generated)
   - user_id (UUID, foreign key to users.id)
   - original_text (text, required)
   - corrected_text (text, required)
   - audio_url (text)
   - region (varchar)
   - earnings (decimal, default 0.10)
   - submitted_at (timestamp, default now)

Also enable Row Level Security (RLS) on both tables.
```

Cursor will use MCP to create the migration and apply it!

### 4.2 Verify Tables Created
Ask Cursor:
```
Show me my Supabase database tables
```

You should now see:
- ✅ `users` table
- ✅ `training_submissions` table

### 4.3 Create Storage Bucket for Audio Files
Ask Cursor:
```
Create a public storage bucket called "audio-submissions" for audio files
```

---

## Step 5: Create Helper Function

### 5.1 Add Function to Increment User Points
Ask Cursor:
```
Create a Supabase function called increment_user_earnings that:
- Takes user_id (UUID) and amount (decimal) as parameters
- Increments the user's total_earnings by the amount
- Updates the updated_at timestamp
```

This makes it easy to award points when users submit training data.

---

## Step 6: Update Environment Variables

Make sure your `.env.local` has:

```bash
# Privy Auth (you already have this)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Supabase (you already have this)
NEXT_PUBLIC_SUPABASE_URL=https://ipgszcciuxqssikcbrfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service role key for server-side operations (if needed)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## What You Can Now Do

### ✅ Tables Created! Now You Can:

1. **Test Your Setup**
   ```
   Show me all tables and their columns
   ```

2. **Insert Test Data**
   ```
   Add a test user to my database with email test@example.com
   ```

3. **Query Data**
   ```
   Show me all users in the database
   ```

4. **Build Features**
   Ask Cursor to help build:
   - API routes for user management
   - Submission handling
   - Leaderboard queries
   - Dashboard components

---

## Common Tasks (Use These Prompts)

### View Database Schema
```
Show me the structure of the users table
```

### Generate Queries
```
Write a query to get top 10 users by total_earnings
```

### Create API Routes
```
Create an API route at /api/users that:
- POST: Creates a new user with email, privyId, and region
- GET: Gets a user by email query parameter
```

### Debug Issues
```
Check if there are any users in my database
```

---

## Database Schema Reference

### Users Table
```sql
users
├── id (UUID, primary key)
├── email (varchar, unique)
├── privy_id (varchar, unique) -- from Privy auth
├── region (varchar) -- Malaysian region
├── total_earnings (decimal) -- Points (not real money!)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Training Submissions Table
```sql
training_submissions
├── id (UUID, primary key)
├── user_id (UUID, foreign key → users)
├── original_text (text) -- AI generated text
├── corrected_text (text) -- User corrected text
├── audio_url (text) -- URL to audio file in storage
├── region (varchar) -- Region of submission
├── earnings (decimal) -- Points earned (default 0.10)
└── submitted_at (timestamp)
```

### Storage Bucket
- **Name**: `audio-submissions`
- **Type**: Public
- **Contents**: User audio recordings (webm, mp3)

---

## Common Use Cases

### 1. Add User on First Login (Already Implemented)
When user signs in with Privy:
```typescript
// POST /api/users
{
  "email": user.email,
  "privyId": user.id,
  "region": selectedRegion
}
```

### 2. Submit Training Data (Already Implemented)
When user completes training:
```typescript
// POST /api/submissions
{
  "userId": user.id,
  "originalText": "...",
  "correctedText": "...",
  "audioData": base64AudioData,
  "region": user.region
}
```

### 3. Get User Stats (You can now build this easily!)
Ask AI: "Create an API route to get user statistics including total points, submission count, and rank"

### 4. Leaderboard (You can now build this easily!)
Ask AI: "Create a leaderboard component showing top users by points"

---

## Points System (Gamification)

**Important**: `total_earnings` and `earnings` are **POINTS**, not real money!

- Users earn 0.10 points per submission
- It's just for gamification and engagement
- Display as "points" or "score" in UI
- Consider renaming to `total_points` in future migration

---

## Security Notes

### ✅ Already Secured:
- Row Level Security (RLS) enabled
- Storage policies configured
- API validates user data

### ⚠️ Remember:
- Service role key = full database access (keep it secret!)
- Only use service role key server-side (never in browser)
- Anon key is safe for browser use (already public in your app)

---

## Troubleshooting

### MCP Not Working?
1. Check Cursor settings → MCP Servers
2. Verify your service role key is correct
3. Restart Cursor completely
4. Check Cursor logs for errors

### Database Connection Failed?
1. Verify project URL is correct: `https://ipgszcciuxqssikcbrfk.supabase.co`
2. Check if Supabase project is active (not paused)
3. Verify service role key has proper permissions

### AI Can't See Tables?
1. Make sure tables are created (Step 4)
2. Try asking: "List all tables in my Supabase database"
3. Restart Cursor and try again

### Table Creation Failed?
If the AI can't create tables automatically:

1. **Manual Method** - Go to Supabase SQL Editor:
   https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/sql/new

2. **Copy and paste this SQL**:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  privy_id VARCHAR(255) UNIQUE,
  region VARCHAR(100),
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create training_submissions table
CREATE TABLE IF NOT EXISTS training_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  audio_url TEXT,
  region VARCHAR(100),
  earnings DECIMAL(10, 2) DEFAULT 0.10,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on submissions" ON training_submissions FOR ALL USING (true);

-- Create function to increment user earnings
CREATE OR REPLACE FUNCTION increment_user_earnings(
  user_id_input UUID,
  amount DECIMAL
) RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    total_earnings = total_earnings + amount,
    updated_at = NOW()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON training_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_region ON training_submissions(region);
```

3. **Click "Run"** - Your tables will be created!

4. **Create Storage Bucket** - Go to Storage:
   https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/storage/buckets
   - Click "New bucket"
   - Name: `audio-submissions`
   - Make it public
   - Click "Create bucket"

---

## Next Steps - After Tables Are Created

Once your tables are set up, you can easily build:

1. **User Management API** - Connect Privy auth to Supabase
   ```
   Create API routes for user creation and retrieval
   ```

2. **Submission System** - Save training data with audio
   ```
   Create API to save submissions and upload audio to storage
   ```

3. **Dashboard Page** - Show user stats and progress
   ```
   Create a dashboard component showing user points and submission count
   ```

4. **Leaderboard** - Top contributors by points
   ```
   Create a leaderboard showing top 10 users by total_earnings
   ```

5. **History Page** - User's past submissions
   ```
   Create a page showing all submissions for the current user
   ```

Just ask Cursor AI to help build these features - it can now access your database schema and help generate code!

---

## Quick Start Checklist

Use this checklist to get up and running:

- [ ] **Step 1**: Copy Supabase URL and Service Role Key
- [ ] **Step 2**: Add MCP config to Cursor settings
- [ ] **Step 3**: Restart Cursor and verify connection
- [ ] **Step 4**: Create tables (either with AI or manual SQL)
- [ ] **Step 5**: Create storage bucket for audio files
- [ ] **Step 6**: Update `.env.local` with your keys
- [ ] **Step 7**: Test by asking AI to show your tables
- [ ] **Step 8**: Start building features!

---

## Example Prompts to Try (After Tables Are Created)

```
1. "Show me all users in my database"

2. "Create a React component to display user's submission history"

3. "Write a query to get the top 10 users by total_earnings"

4. "Generate an API route for leaderboard with pagination"

5. "Help me create an API route to save a training submission with audio"

6. "Show me how many submissions each region has"
```

---

## Support

If you need help:
1. Check Supabase logs: https://supabase.com/dashboard/project/ipgszcciuxqssikcbrfk/logs
2. Ask Cursor AI: It can help debug database issues now!
3. Supabase docs: https://supabase.com/docs

---

## That's It! 🎉

Follow the steps in order:
1. ✅ Get Supabase credentials
2. ✅ Configure MCP in Cursor
3. ✅ Verify connection
4. ✅ **Create tables** (Step 4 - Very Important!)
5. ✅ Create storage bucket
6. ✅ Update environment variables
7. ✅ Start building!

Once tables are created, you have:
- ✅ Supabase MCP connected to Cursor
- ✅ AI can read your database schema
- ✅ AI can help write queries and migrations
- ✅ Faster development with intelligent suggestions
- ✅ Database ready for your voice training app!

Start building features by asking Cursor AI for help!

