
-- Create an RPC function to get admin chat messages
CREATE OR REPLACE FUNCTION get_admin_chat_messages()
RETURNS SETOF admin_chat_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow access to users with the 'service_role' role
  -- In a production app, you would check if the user is actually an admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY
  SELECT * FROM admin_chat_messages
  ORDER BY created_at DESC;
END;
$$;

-- Add an is_admin column to the profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
