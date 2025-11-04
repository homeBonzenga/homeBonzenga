# Fix 409 Conflict Error During Login

## Problem
Getting `409 (Conflict)` error when trying to sign in. This happens because:
1. The database trigger tries to create a user in `public.users` when a user signs in
2. The code also tries to create/upsert the user
3. This creates a race condition causing a conflict

## Solution

### Option 1: Run SQL Migration (Recommended)
Run this migration in Supabase SQL Editor to fix the trigger and sync users:

**File**: `supabase/migrations/20250131_fix_duplicate_users_and_trigger.sql`

This migration will:
- ✅ Fix duplicate users (if any)
- ✅ Update the trigger to handle conflicts gracefully
- ✅ Sync missing users from `auth.users` to `public.users`
- ✅ Verify RLS policies

### Option 2: Manual Fix (If migration doesn't work)

#### Step 1: Check for duplicate users
```sql
-- Check for duplicate emails
SELECT email, COUNT(*) as count
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1;
```

If duplicates exist, remove them (keep the most recent):
```sql
DELETE FROM public.users
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC) as rn
    FROM public.users
  ) ranked
  WHERE rn > 1
);
```

#### Step 2: Update the trigger function
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists (handle race conditions)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  -- Insert new user with conflict handling
  INSERT INTO public.users (id, email, first_name, last_name, role, status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER'),
    'ACTIVE',
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Step 3: Verify trigger exists
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

If it doesn't exist, create it:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
```

## Code Changes Made

The code in `frontend/src/lib/supabaseAuth.ts` has been updated to:
- ✅ Handle 409 errors gracefully
- ✅ Retry fetching user after conflict
- ✅ Use `maybeSingle()` instead of `single()` to avoid errors
- ✅ Add better error handling for race conditions

## What Changed

**Before:**
- Code would fail with 409 error if trigger created user simultaneously
- No retry logic for conflicts

**After:**
- Detects 409 conflicts and fetches the user that was created
- Multiple retry attempts with delays
- Graceful fallback to auth metadata if all else fails

## Testing

After running the migration:

1. **Try to sign in** - should work without 409 errors
2. **Check browser console** - should see success messages like:
   - `✅ User profile found after retry (created by trigger)`
   - `✅ User profile fetched after conflict`
3. **Verify user exists** in `public.users`:
   ```sql
   SELECT id, email, role, status FROM public.users WHERE email = 'your-email@example.com';
   ```

## Troubleshooting

### If 409 error still occurs:

1. **Check if user exists in both tables:**
   ```sql
   -- Check auth.users
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Check public.users
   SELECT id, email FROM public.users WHERE email = 'your-email@example.com';
   ```

2. **Check RLS policies:**
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'users' AND policyname LIKE '%insert%';
   ```
   
   Should have: "Users can insert their own profile"

3. **Check trigger function:**
   ```sql
   SELECT routine_name, routine_definition
   FROM information_schema.routines
   WHERE routine_name = 'handle_new_user';
   ```

4. **Manual sync if needed:**
   ```sql
   -- For a specific user
   INSERT INTO public.users (id, email, first_name, last_name, role, status)
   SELECT 
     id, 
     email,
     'User',
     '',
     'CUSTOMER',
     'ACTIVE'
   FROM auth.users
   WHERE email = 'your-email@example.com'
   ON CONFLICT (id) DO NOTHING;
   ```

## Expected Behavior

After the fix:
- ✅ Login should work without 409 errors
- ✅ User profile is created automatically by trigger
- ✅ Code handles conflicts gracefully
- ✅ No duplicate users created

