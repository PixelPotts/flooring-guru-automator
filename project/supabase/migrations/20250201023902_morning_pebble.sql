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
  _full_name text;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Construct full name
  _full_name := COALESCE(contact_data->>'firstName', '') || ' ' || COALESCE(contact_data->>'lastName', '');
  _full_name := TRIM(_full_name);

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
    _full_name,
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
    name = EXCLUDED.name,
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
    'name', _full_name,
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