-- Function to import GHL contact with proper ID handling
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
  _full_name text;
  _ghl_id text;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get GHL ID
  _ghl_id := contact_data->>'id';
  IF _ghl_id IS NULL THEN
    RAISE EXCEPTION 'GHL contact ID is required';
  END IF;

  -- Construct full name
  _full_name := COALESCE(contact_data->>'firstName', '') || ' ' || COALESCE(contact_data->>'lastName', '');
  _full_name := TRIM(_full_name);

  -- Check if client with GHL ID exists
  SELECT id INTO _client_id
  FROM clients
  WHERE ghl_contact_id = _ghl_id;

  IF _client_id IS NULL THEN
    -- Insert new client
    INSERT INTO clients (
      id,
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
      gen_random_uuid(),
      _full_name,
      contact_data->>'companyName',
      contact_data->>'email',
      contact_data->>'phone',
      contact_data->>'address',
      'Residential',
      'Active',
      0,
      0,
      _ghl_id,
      contact_data,
      _user_id,
      now(),
      now()
    )
    RETURNING id INTO _client_id;
  ELSE
    -- Update existing client
    UPDATE clients
    SET
      name = _full_name,
      company = contact_data->>'companyName',
      email = contact_data->>'email',
      phone = contact_data->>'phone',
      address = contact_data->>'address',
      ghl_data = contact_data,
      updated_at = now()
    WHERE id = _client_id;
  END IF;

  -- Build result
  SELECT row_to_json(c)::jsonb INTO _result
  FROM (
    SELECT
      id,
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
      ghl_data
    FROM clients
    WHERE id = _client_id
  ) c;

  RETURN _result;
END;
$$;