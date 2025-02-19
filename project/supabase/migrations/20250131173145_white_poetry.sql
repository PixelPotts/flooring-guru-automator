/*
  # Initial Schema Setup for Flooring CRM

  1. New Tables
    - `profiles`
      - User profiles with authentication
    - `clients` 
      - Client information and metadata
    - `rooms`
      - Room dimensions and details
    - `materials`
      - Material catalog and pricing
    - `labor_items`
      - Labor services and rates
    - `estimates`
      - Project estimates
    - `estimate_items`
      - Line items for estimates
    - `projects`
      - Project tracking and management
    - `project_tasks`
      - Tasks within projects
    - `invoices`
      - Client invoicing
    - `payments`
      - Payment tracking
    - `damage_reports`
      - Floor damage assessments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure client data access
    - Protect financial information

  3. Relationships
    - Clients to Rooms (1:many)
    - Estimates to Items (1:many)
    - Projects to Tasks (1:many)
    - Invoices to Payments (1:many)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  company_name text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  company text,
  email text,
  phone text,
  address text,
  type text CHECK (type IN ('Residential', 'Commercial')),
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  total_projects integer DEFAULT 0,
  total_revenue decimal(12,2) DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rooms table
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  length decimal(8,2),
  width decimal(8,2),
  sqft decimal(8,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Materials table
CREATE TABLE materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  material_type text NOT NULL,
  brand text,
  default_unit_price decimal(10,2) NOT NULL,
  unit text CHECK (unit IN ('sqft', 'piece', 'box', 'roll', 'linear_ft', 'yard', 'meter')),
  category text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Labor items table
CREATE TABLE labor_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  labor_type text NOT NULL,
  default_hourly_rate decimal(10,2) NOT NULL,
  estimated_hours decimal(6,2),
  category text,
  unit text CHECK (unit IN ('hour', 'day', 'project', 'sqft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Estimates table
CREATE TABLE estimates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  date date DEFAULT CURRENT_DATE,
  subtotal decimal(12,2) NOT NULL,
  tax decimal(12,2) NOT NULL,
  total decimal(12,2) NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Estimate items table
CREATE TABLE estimate_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id uuid REFERENCES estimates(id) ON DELETE CASCADE,
  description text NOT NULL,
  area decimal(10,2),
  unit_price decimal(10,2) NOT NULL,
  quantity decimal(10,2) NOT NULL,
  total decimal(12,2) NOT NULL,
  type text CHECK (type IN ('material', 'labor')),
  room text,
  material_type text,
  brand text,
  labor_type text,
  hourly_rate decimal(10,2),
  hours decimal(6,2),
  created_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  client_id uuid REFERENCES clients(id),
  estimate_id uuid REFERENCES estimates(id),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'on_hold')),
  start_date date,
  end_date date,
  budget decimal(12,2),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project tasks table
CREATE TABLE project_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_to text,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id),
  estimate_id uuid REFERENCES estimates(id),
  project_id uuid REFERENCES projects(id),
  date date DEFAULT CURRENT_DATE,
  due_date date,
  subtotal decimal(12,2) NOT NULL,
  tax decimal(12,2) NOT NULL,
  total decimal(12,2) NOT NULL,
  balance decimal(12,2) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES invoices(id),
  client_id uuid REFERENCES clients(id),
  amount decimal(12,2) NOT NULL,
  method text CHECK (method IN ('credit_card', 'check', 'cash', 'bank_transfer')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  date date DEFAULT CURRENT_DATE,
  reference text,
  check_number text,
  card_last4 text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Damage reports table
CREATE TABLE damage_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id),
  date date DEFAULT CURRENT_DATE,
  severity decimal(3,2) CHECK (severity >= 0 AND severity <= 1),
  image_url text,
  issues jsonb,
  recommendations jsonb,
  costs jsonb,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Clients: Users can read all clients but only modify ones they created
CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Rooms: Users can manage rooms for clients they created
CREATE POLICY "Users can manage rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = rooms.client_id
      AND clients.created_by = auth.uid()
    )
  );

-- Materials & Labor: All authenticated users can view, only admins can modify
CREATE POLICY "Users can view materials"
  ON materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view labor items"
  ON labor_items FOR SELECT
  TO authenticated
  USING (true);

-- Estimates: Users can manage their own estimates
CREATE POLICY "Users can manage estimates"
  ON estimates FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can manage estimate items"
  ON estimate_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = estimate_items.estimate_id
      AND estimates.created_by = auth.uid()
    )
  );

-- Projects: Users can manage their own projects
CREATE POLICY "Users can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can manage project tasks"
  ON project_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.created_by = auth.uid()
    )
  );

-- Invoices: Users can manage their own invoices
CREATE POLICY "Users can manage invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

-- Payments: Users can manage payments for their invoices
CREATE POLICY "Users can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.created_by = auth.uid()
    )
  );

-- Damage Reports: Users can manage their own reports
CREATE POLICY "Users can manage damage reports"
  ON damage_reports FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for better query performance
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_estimates_client_id ON estimates(client_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_rooms_client_id ON rooms(client_id);
CREATE INDEX idx_damage_reports_client_id ON damage_reports(client_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_labor_items_updated_at
  BEFORE UPDATE ON labor_items
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();