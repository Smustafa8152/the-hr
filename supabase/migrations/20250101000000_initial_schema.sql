-- Enable UUID extension (Supabase uses gen_random_uuid() by default)
-- create extension if not exists "uuid-ossp";

-- Employees Table
create table public.employees (
  id uuid default gen_random_uuid() primary key,
  employee_id text unique not null,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  department text,
  designation text,
  join_date date,
  status text default 'Active',
  avatar_url text,
  manager_id uuid references public.employees(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attendance Logs Table
create table public.attendance_logs (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) not null,
  date date not null,
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  status text, -- Present, Late, Absent, Leave
  late_minutes integer default 0,
  overtime_minutes integer default 0,
  is_regularized boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leave Requests Table
create table public.leave_requests (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) not null,
  leave_type text not null, -- Annual, Sick, Unpaid
  start_date date not null,
  end_date date not null,
  reason text,
  status text default 'Pending', -- Pending, Approved, Rejected
  approved_by uuid references public.employees(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payroll Cycles Table
create table public.payroll_cycles (
  id uuid default gen_random_uuid() primary key,
  period_name text not null, -- e.g., "December 2025"
  start_date date not null,
  end_date date not null,
  status text default 'Draft', -- Draft, Processing, Approved, Paid
  total_amount numeric(12, 2) default 0,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.employees enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.leave_requests enable row level security;
alter table public.payroll_cycles enable row level security;

-- Create policies (Open access for demo purposes, restrict in production)
create policy "Enable read access for all users" on public.employees for select using (true);
create policy "Enable read access for all users" on public.attendance_logs for select using (true);
create policy "Enable read access for all users" on public.leave_requests for select using (true);
create policy "Enable read access for all users" on public.payroll_cycles for select using (true);

-- Insert Dummy Data
insert into public.employees (employee_id, first_name, last_name, email, department, designation, join_date, status)
values 
('EMP-001', 'Sarah', 'Connor', 'sarah@thesystem.com', 'Engineering', 'Senior Engineer', '2023-01-15', 'Active'),
('EMP-002', 'John', 'Doe', 'john@thesystem.com', 'Sales', 'Sales Manager', '2023-03-10', 'Active'),
('EMP-003', 'Jane', 'Smith', 'jane@thesystem.com', 'HR', 'HR Specialist', '2023-06-01', 'Active');

