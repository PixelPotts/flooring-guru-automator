-- Add missing columns to estimates table
ALTER TABLE estimates 
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS room_dimensions jsonb;

-- Update existing RLS policies
DROP POLICY IF EXISTS "Users can manage estimates" ON estimates;

CREATE POLICY "Users can manage estimates"
  ON estimates
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_estimates_client_name ON estimates(client_name);