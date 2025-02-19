/*
  # Fix Schema Issues

  1. Changes
    - Rename client columns to match frontend expectations
    - Add missing columns
    - Update column types
  
  2. Security
    - Maintain existing RLS policies
*/

-- Rename columns to match frontend expectations
ALTER TABLE clients 
  RENAME COLUMN total_projects TO "totalProjects";

ALTER TABLE clients 
  RENAME COLUMN total_revenue TO "totalRevenue";

-- Add any missing columns
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS "totalProjects" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalRevenue" decimal(12,2) DEFAULT 0;

-- Update column types if needed
ALTER TABLE clients 
  ALTER COLUMN "totalProjects" SET DEFAULT 0,
  ALTER COLUMN "totalRevenue" SET DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_total_projects ON clients("totalProjects");
CREATE INDEX IF NOT EXISTS idx_clients_total_revenue ON clients("totalRevenue");