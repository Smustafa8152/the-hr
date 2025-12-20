-- Create Timesheets Table
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  week TEXT NOT NULL,
  project TEXT NOT NULL,
  hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'Draft',
  total_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  uploaded_by UUID REFERENCES employees(id),
  upload_date DATE DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  month TEXT NOT NULL,
  basic_salary NUMERIC NOT NULL,
  allowances NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_salary NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Applied',
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  applied_date DATE DEFAULT CURRENT_DATE,
  rating NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional but recommended)
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Create Policies (Simplified for now - allow all for authenticated users)
CREATE POLICY "Enable all access for authenticated users" ON timesheets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON payroll FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON candidates FOR ALL USING (auth.role() = 'authenticated');
