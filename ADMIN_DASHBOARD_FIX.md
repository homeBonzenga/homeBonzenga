# Admin Dashboard Data Fetching Fix

## Problem
The admin dashboard was showing all counts as 0 because Row Level Security (RLS) policies were blocking admin queries.

## Solution
Two main fixes have been implemented:

### 1. Comprehensive RLS Policies Migration
A new migration file has been created: `supabase/migrations/20250131_add_comprehensive_admin_policies.sql`

This migration adds admin policies for ALL tables:
- users
- vendors
- bookings
- payments
- services
- reviews
- addresses
- booking_items
- addons
- vendor_slots
- audit_logs

**IMPORTANT: You MUST run this migration in Supabase for the dashboard to work!**

### 2. Improved Dashboard Code
The dashboard code has been updated with:
- Better error handling and logging
- Admin role verification before fetching data
- Detailed console logging for debugging
- RLS error detection and user-friendly messages

## Steps to Fix

### Step 1: Run the Migration in Supabase

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250131_add_comprehensive_admin_policies.sql`
4. Run the migration

OR use Supabase CLI:
```bash
supabase migration up
```

### Step 2: Verify Admin User Exists

Make sure you have an admin user in the `users` table:

```sql
SELECT id, email, role, status FROM users WHERE role = 'ADMIN';
```

If no admin user exists, create one:

```sql
-- Insert admin user (replace with your actual email and password hash)
INSERT INTO users (email, password, first_name, last_name, role, status)
VALUES (
  'admin@homebonzenga.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.VpO/iG', -- password: admin123
  'System',
  'Admin',
  'ADMIN',
  'ACTIVE'
);
```

### Step 3: Test the Dashboard

1. Log in as an admin user
2. Navigate to `/admin` route
3. Open browser console (F12) to see detailed logs
4. Click the "Refresh" button
5. Check that data is now being fetched and displayed

## Debugging

If data is still showing as 0:

1. **Check Browser Console**: Look for RLS error messages
2. **Verify Migration Ran**: Check if the `is_admin()` function exists:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' AND routine_name = 'is_admin';
   ```
3. **Check Admin Policies**: Verify policies exist:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE policyname LIKE '%Admin%';
   ```
4. **Verify User Role**: Make sure your logged-in user has `role = 'ADMIN'`:
   ```sql
   SELECT id, email, role, status FROM users WHERE id = 'YOUR_USER_ID';
   ```

## What Changed in the Code

### Dashboard.tsx Changes:
- Added admin role verification before fetching data
- Enhanced error handling with detailed RLS error detection
- Added comprehensive console logging for debugging
- Improved error messages to guide users

### New Migration File:
- `20250131_add_comprehensive_admin_policies.sql` - Adds admin policies for all tables

## Expected Behavior

After running the migration:
- ✅ Admin can view all users, vendors, managers
- ✅ Admin can view all bookings and payments
- ✅ Dashboard displays correct counts
- ✅ Revenue calculations work properly
- ✅ Pending approvals and payouts are displayed

## Notes

- The migration uses a helper function `is_admin()` that checks if the current authenticated user has the ADMIN role
- All policies are set to `SECURITY DEFINER` to ensure they work correctly
- The policies allow full CRUD access for admins on all tables

