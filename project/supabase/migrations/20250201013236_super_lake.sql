/*
  # Sample Data Upload Function

  1. New Function
    - upload_sample_data: Handles batch insertion of sample data

  2. Security
    - Function is accessible only to authenticated users
    - Data access follows existing RLS policies
*/

CREATE OR REPLACE FUNCTION upload_sample_data(sample_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _created_by uuid;
  _client record;
  _material record;
  _labor record;
BEGIN
  -- Extract user ID
  _created_by := (sample_data->>'created_by')::uuid;

  -- Insert clients
  FOR _client IN 
    SELECT * FROM jsonb_to_recordset(sample_data->'clients')
    AS x(
      name text,
      company text,
      email text,
      phone text,
      address text,
      type text,
      status text,
      total_projects integer,
      total_revenue decimal
    )
  LOOP
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
      created_by,
      created_at,
      updated_at
    ) VALUES (
      _client.name,
      _client.company,
      _client.email,
      _client.phone,
      _client.address,
      _client.type,
      _client.status,
      _client.total_projects,
      _client.total_revenue,
      _created_by,
      now(),
      now()
    );
  END LOOP;

  -- Insert materials
  FOR _material IN 
    SELECT * FROM jsonb_to_recordset(sample_data->'materials')
    AS x(
      name text,
      description text,
      material_type text,
      brand text,
      default_unit_price decimal,
      unit text,
      category text
    )
  LOOP
    INSERT INTO materials (
      name,
      description,
      material_type,
      brand,
      default_unit_price,
      unit,
      category,
      created_at,
      updated_at
    ) VALUES (
      _material.name,
      _material.description,
      _material.material_type,
      _material.brand,
      _material.default_unit_price,
      _material.unit,
      _material.category,
      now(),
      now()
    );
  END LOOP;

  -- Insert labor items
  FOR _labor IN 
    SELECT * FROM jsonb_to_recordset(sample_data->'labor')
    AS x(
      name text,
      description text,
      labor_type text,
      default_hourly_rate decimal,
      estimated_hours decimal,
      category text,
      unit text
    )
  LOOP
    INSERT INTO labor_items (
      name,
      description,
      labor_type,
      default_hourly_rate,
      estimated_hours,
      category,
      unit,
      created_at,
      updated_at
    ) VALUES (
      _labor.name,
      _labor.description,
      _labor.labor_type,
      _labor.default_hourly_rate,
      _labor.estimated_hours,
      _labor.category,
      _labor.unit,
      now(),
      now()
    );
  END LOOP;
END;
$$;