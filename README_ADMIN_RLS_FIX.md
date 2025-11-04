# Admin Dashboard User Data Fetch Fix

## Problem
The admin dashboard cannot fetch user data from Supabase due to missing Row Level Security (RLS) policies for admin users.

## Solution

### Step 1: Run the Migration
Apply the RLS policy migration to allow admins to view all users:

```sql
-- File: supabase/migrations/20250131_add_admin_users_policy.sql
```

**To apply the migration:**

1. **If using Supabase CLI:**
   ```bash
   supabase db push
   ```

2. **If using Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/20250131_add_admin_users_policy.sql`
   - Run the SQL

3. **If using Direct Database Connection:**
   - Connect to your PostgreSQL database
   - Run the SQL commands from the migration file

### Step 2: Verify the Policies
After running the migration, verify the policies exist:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

You should see policies including:
- "Admins can view all users"
- "Admins can update all users"
- "Admins can insert users"
- "Managers can view all users"

### Step 3: Test the Dashboard
1. Log in as an admin user
2. Navigate to the admin dashboard
3. Check the browser console for logs
4. User data should now load correctly

## What the Migration Does

The migration adds RLS policies that allow:
- **Admin users** to SELECT, UPDATE, and INSERT all users
- **Manager users** to SELECT all users (read-only)

These policies check if the authenticated user has the ADMIN or MANAGER role before allowing access.

## Troubleshooting

If user data still doesn't load:

1. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
   ```
   Should show `rowsecurity = true`

2. **Check your admin user role:**
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your-admin@email.com';
   ```
   Role should be 'ADMIN' (uppercase)

3. **Check session authentication:**
   - Open browser console
   - Look for "🔍 Admin session verified" log
   - Verify userId and email are correct

4. **Check for RLS errors:**
   - Look for error code 'PGRST301' in console
   - This indicates RLS policy blocking access

## Code Changes Made

1. **Dashboard.tsx**: Added session verification and better error handling
2. **Migration file**: Added RLS policies for admin/manager access
3. **Error messages**: Improved to guide users to fix RLS issues

