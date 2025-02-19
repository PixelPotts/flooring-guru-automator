-- Add GHL contact ID and data to clients table if not exists
DO $$ 
BEGIN
  -- Add ghl_contact_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'ghl_contact_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN ghl_contact_id text;
    ALTER TABLE clients ADD CONSTRAINT clients_ghl_contact_id_key UNIQUE (ghl_contact_id);
  END IF;

  -- Add ghl_data column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'ghl_data'
  ) THEN
    ALTER TABLE clients ADD COLUMN ghl_data jsonb;
  END IF;
END $$;

-- Create index for GHL contact ID if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'clients' AND indexname = 'idx_clients_ghl_contact_id'
  ) THEN
    CREATE INDEX idx_clients_ghl_contact_id ON clients(ghl_contact_id);
  END IF;
END $$;

-- Add any missing RLS policies for GHL settings
DO $$ 
BEGIN
  -- Check if policies exist and create if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ghl_settings' AND policyname = 'Users can view GHL settings'
  ) THEN
    CREATE POLICY "Users can view GHL settings"
      ON ghl_settings FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ghl_settings' AND policyname = 'Users can insert GHL settings'
  ) THEN
    CREATE POLICY "Users can insert GHL settings"
      ON ghl_settings FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ghl_settings' AND policyname = 'Users can update GHL settings'
  ) THEN
    CREATE POLICY "Users can update GHL settings"
      ON ghl_settings FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ghl_settings' AND policyname = 'Users can delete GHL settings'
  ) THEN
    CREATE POLICY "Users can delete GHL settings"
      ON ghl_settings FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;