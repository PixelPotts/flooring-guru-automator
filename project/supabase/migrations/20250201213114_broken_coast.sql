/*
  # Fix inventory schema and column names

  1. Changes
    - Add missing columns with snake_case names
    - Add constraints and indexes
    - Update RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Fix materials table
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'material_type'
  ) THEN
    ALTER TABLE materials ADD COLUMN material_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'default_unit_price'
  ) THEN
    ALTER TABLE materials ADD COLUMN default_unit_price decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'brand'
  ) THEN
    ALTER TABLE materials ADD COLUMN brand text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'unit'
  ) THEN
    ALTER TABLE materials ADD COLUMN unit text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'category'
  ) THEN
    ALTER TABLE materials ADD COLUMN category text;
  END IF;
END $$;

-- Fix labor_items table
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'labor_items' AND column_name = 'labor_type'
  ) THEN
    ALTER TABLE labor_items ADD COLUMN labor_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'labor_items' AND column_name = 'default_hourly_rate'
  ) THEN
    ALTER TABLE labor_items ADD COLUMN default_hourly_rate decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'labor_items' AND column_name = 'estimated_hours'
  ) THEN
    ALTER TABLE labor_items ADD COLUMN estimated_hours decimal(6,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'labor_items' AND column_name = 'unit'
  ) THEN
    ALTER TABLE labor_items ADD COLUMN unit text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'labor_items' AND column_name = 'category'
  ) THEN
    ALTER TABLE labor_items ADD COLUMN category text;
  END IF;
END $$;

-- Add constraints
ALTER TABLE materials 
  DROP CONSTRAINT IF EXISTS materials_unit_check;

ALTER TABLE materials 
  ADD CONSTRAINT materials_unit_check 
  CHECK (unit IN ('sqft', 'piece', 'box', 'roll', 'linear_ft', 'yard', 'meter'));

ALTER TABLE labor_items 
  DROP CONSTRAINT IF EXISTS labor_items_unit_check;

ALTER TABLE labor_items 
  ADD CONSTRAINT labor_items_unit_check 
  CHECK (unit IN ('hour', 'day', 'project', 'sqft'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_material_type ON materials(material_type);
CREATE INDEX IF NOT EXISTS idx_labor_items_category ON labor_items(category);
CREATE INDEX IF NOT EXISTS idx_labor_items_labor_type ON labor_items(labor_type);

-- Update RLS policies
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access for all authenticated users on materials" ON materials;
DROP POLICY IF EXISTS "Allow read access for all authenticated users on labor_items" ON labor_items;
DROP POLICY IF EXISTS "Allow full access for authenticated users on materials" ON materials;
DROP POLICY IF EXISTS "Allow full access for authenticated users on labor_items" ON labor_items;

-- Create new policies
CREATE POLICY "Allow read access for all authenticated users on materials"
ON materials FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read access for all authenticated users on labor_items"
ON labor_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow full access for authenticated users on materials"
ON materials FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow full access for authenticated users on labor_items"
ON labor_items FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);