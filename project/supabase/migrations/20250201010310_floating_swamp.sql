/*
  # Add GHL Settings Table

  1. New Tables
    - `ghl_settings`
      - `id` (uuid, primary key)
      - `location_id` (text, required)
      - `access_token` (text, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_sync` (timestamptz)
      - `sync_status` (text)
      - `sync_error` (text)

  2. Security
    - Enable RLS on `ghl_settings` table
    - Add policies for authenticated users
*/

-- Create GHL Settings table
CREATE TABLE ghl_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id text NOT NULL,
  access_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sync timestamptz,
  sync_status text CHECK (sync_status IN ('success', 'failed', 'syncing')),
  sync_error text,
  created_by uuid REFERENCES auth.users(id)
);

-- Add unique constraint on location_id
CREATE UNIQUE INDEX ghl_settings_location_id_key ON ghl_settings(location_id);

-- Enable Row Level Security
ALTER TABLE ghl_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view GHL settings"
  ON ghl_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert GHL settings"
  ON ghl_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update GHL settings"
  ON ghl_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete GHL settings"
  ON ghl_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Add GHL contact ID to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ghl_contact_id text UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ghl_data jsonb;

-- Create index for GHL contact ID
CREATE INDEX IF NOT EXISTS idx_clients_ghl_contact_id ON clients(ghl_contact_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ghl_settings_updated_at
  BEFORE UPDATE ON ghl_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();