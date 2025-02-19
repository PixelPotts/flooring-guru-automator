-- Add items column and ensure all estimate columns exist
ALTER TABLE estimates 
  ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS room_dimensions jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS rooms jsonb DEFAULT '[]'::jsonb;

-- Drop estimate_items table if it exists since we're using JSONB
DROP TABLE IF EXISTS estimate_items CASCADE;

-- Update existing RLS policies
DROP POLICY IF EXISTS "Users can manage estimates" ON estimates;

CREATE POLICY "Users can manage estimates"
  ON estimates
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_estimates_client_name ON estimates(client_name);
CREATE INDEX IF NOT EXISTS idx_estimates_created_by ON estimates(created_by);

-- Add validation trigger for items JSONB
CREATE OR REPLACE FUNCTION validate_estimate_items()
RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
BEGIN
  -- Ensure items is an array
  IF NOT jsonb_typeof(NEW.items) = 'array' THEN
    RAISE EXCEPTION 'items must be a JSON array';
  END IF;

  -- Validate each item in the array
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    IF NOT (
      item ? 'id' AND
      item ? 'description' AND
      item ? 'quantity' AND
      item ? 'unitPrice' AND
      item ? 'total' AND
      item ? 'type'
    ) THEN
      RAISE EXCEPTION 'Each item must have id, description, quantity, unitPrice, total, and type fields';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_estimate_items_trigger ON estimates;
CREATE TRIGGER validate_estimate_items_trigger
  BEFORE INSERT OR UPDATE ON estimates
  FOR EACH ROW
  WHEN (NEW.items IS NOT NULL)
  EXECUTE FUNCTION validate_estimate_items();