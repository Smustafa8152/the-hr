-- Timesheet Entries Table
-- Employees can log their work hours per day
-- Reports are only visible to admin when submitted

CREATE TABLE IF NOT EXISTS public.timesheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked NUMERIC(4, 2) NOT NULL DEFAULT 0, -- Hours worked (e.g., 8.5 for 8 hours 30 minutes)
  description TEXT, -- What work was done
  project_name TEXT, -- Optional project name
  task_type TEXT, -- Optional task type (e.g., 'Development', 'Meeting', 'Support')
  is_submitted BOOLEAN NOT NULL DEFAULT FALSE, -- Only submitted entries are visible to admin
  submitted_at TIMESTAMPTZ, -- When the entry was submitted as report
  report_type TEXT, -- 'daily' or 'weekly'
  week_start_date DATE, -- For weekly reports, the start date of the week
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_employee_date_entry UNIQUE(employee_id, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_employee_id ON public.timesheet_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_date ON public.timesheet_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_submitted ON public.timesheet_entries(is_submitted);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_employee_date ON public.timesheet_entries(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_week_start ON public.timesheet_entries(week_start_date);

-- Enable RLS
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Employees can read their own timesheet entries
DROP POLICY IF EXISTS "Employees can read their own timesheet entries" ON public.timesheet_entries;
CREATE POLICY "Employees can read their own timesheet entries" ON public.timesheet_entries
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND employee_id = timesheet_entries.employee_id
    )
  );

-- Employees can insert their own timesheet entries
DROP POLICY IF EXISTS "Employees can insert their own timesheet entries" ON public.timesheet_entries;
CREATE POLICY "Employees can insert their own timesheet entries" ON public.timesheet_entries
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND employee_id = timesheet_entries.employee_id
    )
  );

-- Employees can update their own timesheet entries (only if not submitted)
DROP POLICY IF EXISTS "Employees can update their own timesheet entries" ON public.timesheet_entries;
CREATE POLICY "Employees can update their own timesheet entries" ON public.timesheet_entries
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND employee_id = timesheet_entries.employee_id
    )
    AND is_submitted = FALSE
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND employee_id = timesheet_entries.employee_id
    )
  );

-- Employees can delete their own timesheet entries (only if not submitted)
DROP POLICY IF EXISTS "Employees can delete their own timesheet entries" ON public.timesheet_entries;
CREATE POLICY "Employees can delete their own timesheet entries" ON public.timesheet_entries
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND employee_id = timesheet_entries.employee_id
    )
    AND is_submitted = FALSE
  );

-- Admins can read all submitted timesheet entries in their company
DROP POLICY IF EXISTS "Admins can read submitted timesheet entries" ON public.timesheet_entries;
CREATE POLICY "Admins can read submitted timesheet entries" ON public.timesheet_entries
  FOR SELECT 
  USING (
    is_submitted = TRUE
    AND EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.user_roles ur ON e.company_id = ur.company_id
      WHERE e.id = timesheet_entries.employee_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update submitted timesheet entries (for approval/rejection)
DROP POLICY IF EXISTS "Admins can update submitted timesheet entries" ON public.timesheet_entries;
CREATE POLICY "Admins can update submitted timesheet entries" ON public.timesheet_entries
  FOR UPDATE 
  USING (
    is_submitted = TRUE
    AND EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.user_roles ur ON e.company_id = ur.company_id
      WHERE e.id = timesheet_entries.employee_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timesheet_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_timesheet_entries_updated_at ON public.timesheet_entries;
CREATE TRIGGER trigger_update_timesheet_entries_updated_at
  BEFORE UPDATE ON public.timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_timesheet_entries_updated_at();

