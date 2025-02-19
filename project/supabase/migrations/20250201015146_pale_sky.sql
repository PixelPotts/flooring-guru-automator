/*
  # Add GHL Contact Sync Function
  
  1. New Functions
    - sync_ghl_contacts: Syncs contacts from GHL to local database
    - fetch_ghl_contacts: Fetches contacts from GHL API
    - process_ghl_contact: Processes and saves a single GHL contact

  2. Security
    - All functions are SECURITY DEFINER to run with elevated privileges
    - Input validation and error handling
    - Proper schema search path

  3. Changes
    - Adds support for batch contact syncing
    - Handles pagination from GHL API
    - Updates sync status tracking
*/

-- Function to sync GHL contacts
CREATE OR REPLACE FUNCTION sync_ghl_contacts(
  access_token text,
  location_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _contacts jsonb;
  _contact jsonb;
  _page integer := 1;
  _has_more boolean := true;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update sync status to started
  UPDATE ghl_settings
  SET 
    sync_status = 'syncing',
    last_sync = now(),
    sync_error = null
  WHERE created_by = _user_id;

  -- Fetch and process contacts in batches
  WHILE _has_more LOOP
    -- Fetch contacts from GHL
    SELECT * INTO _contacts
    FROM fetch_ghl_contacts(access_token, location_id, _page);

    -- Process each contact
    FOR _contact IN SELECT * FROM jsonb_array_elements(_contacts)
    LOOP
      PERFORM process_ghl_contact(_contact, _user_id);
    END LOOP;

    -- Check if there are more pages
    _has_more := jsonb_array_length(_contacts) > 0;
    _page := _page + 1;

    -- Add delay to avoid rate limiting
    PERFORM pg_sleep(0.1);
  END LOOP;

  -- Update sync status to completed
  UPDATE ghl_settings
  SET 
    sync_status = 'success',
    last_sync = now(),
    sync_error = null
  WHERE created_by = _user_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Update sync status to failed
    UPDATE ghl_settings
    SET 
      sync_status = 'failed',
      sync_error = SQLERRM
    WHERE created_by = _user_id;
    
    RAISE EXCEPTION 'Failed to sync GHL contacts: %', SQLERRM;
END;
$$;

-- Function to fetch contacts from GHL API
CREATE OR REPLACE FUNCTION fetch_ghl_contacts(
  access_token text,
  location_id text,
  page integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _response jsonb;
BEGIN
  -- Call GHL API
  SELECT content::jsonb INTO _response
  FROM http((
    'GET',
    format(
      'https://rest.gohighlevel.com/v1/contacts/?locationId=%s&page=%s&limit=100',
      location_id,
      page
    ),
    ARRAY[
      ('Authorization', format('Bearer %s', access_token))::http_header,
      ('Version', '2021-07-28')::http_header
    ],
    NULL,
    NULL
  )::http_request);

  -- Return contacts array
  RETURN _response->'contacts';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to fetch GHL contacts: %', SQLERRM;
END;
$$;

-- Function to process a single GHL contact
CREATE OR REPLACE FUNCTION process_ghl_contact(
  contact jsonb,
  user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update client record
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
    format('%s %s', contact->>'firstName', contact->>'lastName'),
    contact->>'companyName',
    contact->>'email',
    contact->>'phone',
    contact->>'address',
    'Residential',
    'Active',
    0,
    0,
    contact->>'id',
    contact,
    user_id,
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
    updated_at = now();
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to process GHL contact: %', SQLERRM;
END;
$$;