-- Drop and recreate http extension to ensure proper setup
DROP EXTENSION IF EXISTS "http" CASCADE;

-- Create http extension in public schema for better accessibility
CREATE EXTENSION "http" WITH SCHEMA public;

-- Drop and recreate the search function to use public.http
DROP FUNCTION IF EXISTS search_ghl_contacts(text);

CREATE OR REPLACE FUNCTION search_ghl_contacts(search_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _settings record;
  _response jsonb;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get GHL settings for user
  SELECT * INTO _settings
  FROM ghl_settings
  WHERE created_by = _user_id
  LIMIT 1;

  IF _settings IS NULL THEN
    RAISE EXCEPTION 'GHL not connected';
  END IF;

  -- Call GHL API using public.http
  SELECT content::jsonb INTO _response
  FROM http((
    'GET',
    format('https://rest.gohighlevel.com/v1/contacts/search?query=%s', search_query),
    ARRAY[
      ('Authorization', format('Bearer %s', _settings.access_token))::http_header,
      ('Version', '2021-07-28')::http_header
    ],
    NULL,
    NULL
  )::http_request);

  -- Return contacts array from response
  RETURN _response->'contacts';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to search GHL contacts: %', SQLERRM;
END;
$$;