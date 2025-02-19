-- Add share-related columns to estimates table if they don't exist
DO $$ 
BEGIN
  -- Add share_token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estimates' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE estimates ADD COLUMN share_token text UNIQUE;
  END IF;

  -- Add share_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estimates' AND column_name = 'share_url'
  ) THEN
    ALTER TABLE estimates ADD COLUMN share_url text;
  END IF;

  -- Add client_feedback column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estimates' AND column_name = 'client_feedback'
  ) THEN
    ALTER TABLE estimates ADD COLUMN client_feedback text;
  END IF;

  -- Add client_viewed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estimates' AND column_name = 'client_viewed_at'
  ) THEN
    ALTER TABLE estimates ADD COLUMN client_viewed_at timestamptz;
  END IF;

  -- Add client_responded_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estimates' AND column_name = 'client_responded_at'
  ) THEN
    ALTER TABLE estimates ADD COLUMN client_responded_at timestamptz;
  END IF;

  -- Add expires_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estimates' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE estimates ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Create or replace functions
CREATE OR REPLACE FUNCTION generate_estimate_share(
  estimate_id uuid,
  expires_in_days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _token text;
  _url text;
  _share_id uuid;
  _result jsonb;
  _base_url text;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify estimate exists and user has access
  IF NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE id = estimate_id
    AND created_by = _user_id
  ) THEN
    RAISE EXCEPTION 'Estimate not found or access denied';
  END IF;

  -- Generate unique token
  _token := encode(gen_random_bytes(32), 'base64');
  -- Get base URL from settings or use default
  _base_url := current_setting('app.settings.base_url', true);
  IF _base_url IS NULL THEN
    _base_url := 'https://flooringguru.app';
  END IF;
  -- Generate share URL
  _url := format('%s/estimates/share/%s', _base_url, _token);

  -- Update estimate with share info
  UPDATE estimates
  SET
    share_token = _token,
    share_url = _url,
    expires_at = now() + (expires_in_days || ' days')::interval,
    updated_at = now()
  WHERE id = estimate_id;

  -- Build result
  _result := jsonb_build_object(
    'token', _token,
    'url', _url,
    'expires_at', (now() + (expires_in_days || ' days')::interval)
  );

  RETURN _result;
END;
$$;

-- Function to get estimate by share token
CREATE OR REPLACE FUNCTION get_estimate_by_token(share_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result jsonb;
BEGIN
  -- Get estimate with client info
  SELECT row_to_json(e)::jsonb INTO _result
  FROM (
    SELECT
      e.*,
      c.name as client_name,
      c.email as client_email,
      c.phone as client_phone
    FROM estimates e
    LEFT JOIN clients c ON c.id = e.client_id
    WHERE e.share_token = share_token
    AND e.expires_at > now()
    AND e.client_responded_at IS NULL
  ) e;

  RETURN _result;
END;
$$;

-- Function to record estimate view
CREATE OR REPLACE FUNCTION record_estimate_view(share_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update estimate
  UPDATE estimates
  SET
    client_viewed_at = COALESCE(client_viewed_at, now()),
    updated_at = now()
  WHERE share_token = share_token;
END;
$$;

-- Function to submit estimate response
CREATE OR REPLACE FUNCTION submit_estimate_response(
  share_token text,
  response_status text,
  response_feedback text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate response status
  IF response_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid response status';
  END IF;

  -- Update estimate
  UPDATE estimates
  SET
    status = response_status,
    client_feedback = response_feedback,
    client_responded_at = now(),
    updated_at = now()
  WHERE share_token = share_token;
END;
$$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'estimates' AND indexname = 'idx_estimates_share_token'
  ) THEN
    CREATE INDEX idx_estimates_share_token ON estimates(share_token);
  END IF;
END $$;