import React, { useState } from 'react';
import { Database, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/common/UIComponents';

const SCHEMA_SQL = `-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Employees Table
create table public.employees (
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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
('EMP-003', 'Jane', 'Smith', 'jane@thesystem.com', 'HR', 'HR Specialist', '2023-06-01', 'Active');`;

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <Database size={32} />
        </div>
        <h1 className="text-3xl font-bold font-heading">Database Setup</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Since this is a client-side application, you need to create the database tables manually in your Supabase project.
        </p>
      </div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-6 flex items-start gap-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-lg font-bold text-amber-500">Action Required</h3>
            <p className="text-muted-foreground mt-2">
              1. Copy the SQL code below.<br/>
              2. Go to your <a href="https://supabase.com/dashboard/project/hlcobldukxhxscqmvcgi/sql" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Supabase SQL Editor <ExternalLink size={12}/></a>.<br/>
              3. Paste the code and click <strong>Run</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-white/5 border-b border-white/5">
          <CardTitle className="font-mono text-sm">schema.sql</CardTitle>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check size={16} className="mr-2 text-emerald-500" /> : <Copy size={16} className="mr-2" />}
            {copied ? 'Copied!' : 'Copy SQL'}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <pre className="p-4 overflow-x-auto text-xs font-mono text-muted-foreground bg-black/20 max-h-[500px]">
            {SCHEMA_SQL}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
