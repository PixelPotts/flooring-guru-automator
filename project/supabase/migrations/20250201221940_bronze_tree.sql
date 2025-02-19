-- Add unique constraint on created_by for ghl_settings
ALTER TABLE ghl_settings DROP CONSTRAINT IF EXISTS ghl_settings_created_by_key;
ALTER TABLE ghl_settings ADD CONSTRAINT ghl_settings_created_by_key UNIQUE (created_by);

-- Update connect function to handle upsert properly
CREATE OR REPLACE FUNCTION connect_ghl_settings(
  p_location_id text,
  p_access_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _result jsonb;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert or update settings
  INSERT INTO ghl_settings (
    location_id,
    access_token,
    created_by,
    sync_status,
    last_sync,
    created_at,
    updated_at
  ) VALUES (
    p_location_id,
    p_access_token,
    _user_id,
    'success',
    now(),
    now(),
    now()
  )
  ON CONFLICT (created_by)
  DO UPDATE SET
    location_id = EXCLUDED.location_id,
    access_token = EXCLUDED.access_token,
    sync_status = EXCLUDED.sync_status,
    last_sync = EXCLUDED.last_sync,
    updated_at = EXCLUDED.updated_at;

  -- Build result
  SELECT jsonb_build_object(
    'location_id', location_id,
    'sync_status', sync_status,
    'last_sync', last_sync
  ) INTO _result
  FROM ghl_settings
  WHERE created_by = _user_id;

  RETURN _result;
END;
$$;