-- Create estimate shares table
CREATE TABLE estimate_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id uuid REFERENCES estimates(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  url text NOT NULL,
  expires_at timestamptz NOT NULL,
  viewed_at timestamptz,
  responded_at timestamptz,
  response text CHECK (response IN ('approved', 'rejected')),
  feedback text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add share-related columns to estimates table
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS share_token text UNIQUE;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS share_url text;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS client_feedback text;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS client_viewed_at timestamptz;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS client_responded_at timestamptz;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Enable RLS
ALTER TABLE estimate_shares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own estimate shares"
  ON estimate_shares FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = estimate_shares.estimate_id
      AND estimates.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create estimate shares"
  ON estimate_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = estimate_shares.estimate_id
      AND estimates.created_by = auth.uid()
    )
  );

-- Create function to generate estimate share
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
  -- Generate share URL (replace with your actual domain)
  _url := format('https://your-domain.com/estimates/share/%s', _token);

  -- Create share record
  INSERT INTO estimate_shares (
    estimate_id,
    token,
    url,
    expires_at,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    estimate_id,
    _token,
    _url,
    now() + (expires_in_days || ' days')::interval,
    _user_id,
    now(),
    now()
  )
  RETURNING id INTO _share_id;

  -- Update estimate with share info
  UPDATE estimates
  SET
    share_token = _token,
    share_url = _url,
    expires_at = now() + (expires_in_days || ' days')::interval,
    updated_at = now()
  WHERE id = estimate_id;

  -- Build result
  SELECT row_to_json(s)::jsonb INTO _result
  FROM (
    SELECT * FROM estimate_shares WHERE id = _share_id
  ) s;

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
  _estimate_id uuid;
  _result jsonb;
BEGIN
  -- Get estimate ID from share
  SELECT estimate_id INTO _estimate_id
  FROM estimate_shares
  WHERE token = share_token
  AND expires_at > now()
  AND response IS NULL;

  IF _estimate_id IS NULL THEN
    RETURN NULL;
  END IF;

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
    WHERE e.id = _estimate_id
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
  -- Update share record
  UPDATE estimate_shares
  SET
    viewed_at = COALESCE(viewed_at, now()),
    updated_at = now()
  WHERE token = share_token;

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

  -- Update share record
  UPDATE estimate_shares
  SET
    response = response_status,
    feedback = response_feedback,
    responded_at = now(),
    updated_at = now()
  WHERE token = share_token;

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

-- Create indexes
CREATE INDEX idx_estimate_shares_token ON estimate_shares(token);
CREATE INDEX idx_estimate_shares_estimate_id ON estimate_shares(estimate_id);
CREATE INDEX idx_estimates_share_token ON estimates(share_token);

-- Add trigger for updated_at
CREATE TRIGGER update_estimate_shares_updated_at
  BEFORE UPDATE ON estimate_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();