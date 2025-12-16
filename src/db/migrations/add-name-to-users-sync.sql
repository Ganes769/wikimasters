-- Add name column to neon_auth.users_sync table
ALTER TABLE neon_auth.users_sync 
ADD COLUMN IF NOT EXISTS name TEXT;
