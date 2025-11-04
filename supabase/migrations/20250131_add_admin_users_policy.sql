-- Add RLS policy to allow ADMIN users to view all users
-- This is needed for the admin dashboard to fetch user data

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create policy for admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

-- Also allow admins to update all users
DROP POLICY IF EXISTS "Admins can update all users" ON users;

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

-- Allow admins to insert users (for creating users via admin panel)
DROP POLICY IF EXISTS "Admins can insert users" ON users;

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

-- Add similar policies for managers if needed
DROP POLICY IF EXISTS "Managers can view all users" ON users;

CREATE POLICY "Managers can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'MANAGER'
    )
  );

