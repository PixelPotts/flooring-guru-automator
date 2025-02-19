-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;

-- Function to search GHL contacts
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

  -- Call GHL API
  SELECT content::jsonb INTO _response
  FROM extensions.http((
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
END;
$$;

-- Function to import GHL contact
CREATE OR REPLACE FUNCTION import_ghl_contact(contact_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _client_id uuid;
  _result jsonb;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert or update client
  INSERT INTO clients (
    name,
    company,
    email,
    phone,
    address,
    type,
    status,
    total_projects,
    total_revenue,
    ghl_contact_id,
    ghl_data,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    format('%s %s', contact_data->>'firstName', contact_data->>'lastName'),
    contact_data->>'companyName',
    contact_data->>'email',
    contact_data->>'phone',
    contact_data->>'address',
    'Residential',
    'Active',
    0,
    0,
    contact_data->>'id',
    contact_data,
    _user_id,
    now(),
    now()
  )
  ON CONFLICT (ghl_contact_id) 
  DO UPDATE SET
    name = format('%s %s', EXCLUDED.name),
    company = EXCLUDED.company,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    ghl_data = EXCLUDED.ghl_data,
    updated_at = now()
  RETURNING id INTO _client_id;

  -- Build result
  _result := jsonb_build_object(
    'id', _client_id,
    'name', format('%s %s', contact_data->>'firstName', contact_data->>'lastName'),
    'company', contact_data->>'companyName',
    'email', contact_data->>'email',
    'phone', contact_data->>'phone',
    'address', contact_data->>'address',
    'type', 'Residential',
    'status', 'Active',
    'total_projects', 0,
    'total_revenue', 0,
    'ghl_contact_id', contact_data->>'id',
    'ghl_data', contact_data
  );

  RETURN _result;
END;
$$;