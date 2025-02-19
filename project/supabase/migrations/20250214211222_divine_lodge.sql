/*
  # Add image column to materials table
  
  1. Changes
    - Add image_url column to materials table
    - Add image_url column to labor_items table
    - Update RLS policies
*/

-- Add image columns if they don't exist
ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE labor_items 
  ADD COLUMN IF NOT EXISTS image_url text;

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view materials" ON materials;
DROP POLICY IF EXISTS "Users can view labor items" ON labor_items;

CREATE POLICY "Users can view materials"
  ON materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view labor items"
  ON labor_items FOR SELECT
  TO authenticated
  USING (true);