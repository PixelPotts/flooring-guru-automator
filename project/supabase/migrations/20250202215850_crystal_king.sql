-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_estimate_share(uuid, integer);

-- Create a function to generate a random token
CREATE OR REPLACE FUNCTION generate_random_token() 
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$;

-- Create or replace the estimate share function
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
  _token := generate_random_token();
  
  -- Generate share URL using the base URL from settings or default
  _url := 'https://flooringguru.app/estimates/share/' || _token;

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

-- Create index for share tokens if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_estimates_share_token ON estimates(share_token);

-- Update RLS policies for estimate sharing
DROP POLICY IF EXISTS "Users can view shared estimates" ON estimates;

CREATE POLICY "Users can view shared estimates"
  ON estimates
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (share_token IS NOT NULL AND expires_at > now())
  );