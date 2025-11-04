# Google OAuth Setup Guide for Supabase

This guide will help you set up Google OAuth authentication with your Supabase project.

## Prerequisites

- A Google Cloud Console account
- A Supabase project with your credentials already configured

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - For development: `http://localhost:3000/auth/callback`
   - Note down your Client ID and Client Secret

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" > "Providers"
4. Find "Google" and click "Configure"
5. Enable Google provider
6. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
7. Set the redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`
8. Save the configuration

## Step 3: Update Your Environment Variables

Make sure your `.env.local` file contains the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Click the "Continue with Google" button
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## Step 5: Database Setup

The implementation automatically creates user records in your `users` table when someone signs in with Google for the first time. Make sure your Supabase database has the following table structure:

```sql
-- Users table (should already exist)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT DEFAULT 'CUSTOMER',
  status TEXT DEFAULT 'ACTIVE',
  avatar TEXT,
  phone TEXT,
  fcmToken TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**:
   - Make sure the redirect URI in Google Console matches exactly: `https://your-project-id.supabase.co/auth/v1/callback`
   - For development, also add: `http://localhost:3000/auth/callback`

2. **"Client ID not found" error**:
   - Verify your Google OAuth Client ID is correct in Supabase
   - Make sure the Google+ API is enabled in Google Cloud Console

3. **"Access blocked" error**:
   - Check if your Google OAuth consent screen is properly configured
   - Make sure your domain is added to authorized domains

4. **User not created in database**:
   - Check your Supabase RLS policies
   - Verify the `users` table exists and has the correct structure
   - Check the browser console for any error messages

### Testing in Development:

1. Make sure your development server is running on the correct port
2. Update the redirect URI in Google Console to include your development URL
3. Clear your browser cache and cookies if you encounter issues

## Security Notes

- Never commit your Google OAuth Client Secret to version control
- Use environment variables for all sensitive credentials
- Regularly rotate your OAuth credentials
- Monitor your Google Cloud Console for any suspicious activity

## Next Steps

After successful setup, you can:
- Customize the OAuth consent screen in Google Cloud Console
- Add additional OAuth providers (Facebook, GitHub, etc.)
- Implement role-based access control
- Add user profile management features

For more information, refer to:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
