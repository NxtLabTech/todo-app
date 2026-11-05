-- Add subtasks column to the todos table
-- Run this in your Supabase SQL Editor if you are upgrading an existing database:
ALTER TABLE todos ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

