-- Update RLS policies for clients table
DROP POLICY IF EXISTS "Users can manage clients" ON clients;

CREATE POLICY "Users can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    -- Allow access if the user created the client directly
    auth.uid() = created_by
    OR
    -- Or if the client was created through GHL sync
    EXISTS (
      SELECT 1 FROM ghl_settings
      WHERE ghl_settings.created_by = auth.uid()
      AND clients.ghl_contact_id IS NOT NULL
    )
  )
  WITH CHECK (
    -- Allow modifications if the user created the client directly
    auth.uid() = created_by
    OR
    -- Or if the client was created through GHL sync
    EXISTS (
      SELECT 1 FROM ghl_settings
      WHERE ghl_settings.created_by = auth.uid()
      AND clients.ghl_contact_id IS NOT NULL
    )
  );

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE clients ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update existing clients to set created_by from GHL settings if available
UPDATE clients
SET created_by = ghl_settings.created_by
FROM ghl_settings
WHERE clients.created_by IS NULL
AND clients.ghl_contact_id IS NOT NULL;