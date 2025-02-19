-- Function to handle numeric IDs in estimate sharing
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
  _result jsonb;
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
  -- Generate share URL
  _url := format('https://flooringguru.app/estimates/share/%s', _token);

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