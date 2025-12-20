export const users = [
  { id: '1', name: 'Admin User', email: 'admin@thesystem.com', role: 'admin', avatar: '/images/avatars/admin.jpg' },
  { id: '2', name: 'HR Manager', email: 'hr@thesystem.com', role: 'hr', avatar: '/images/avatars/hr.jpg' },
  { id: '3', name: 'John Doe', email: 'john@thesystem.com', role: 'employee', avatar: '/images/avatars/john.jpg' },
];

export const employees = [
  {
    id: 'EMP001',
    name: 'Ahmed Al-Sabah',
    designation: 'Senior Engineer',
    department: 'Engineering',
    joinDate: '2020-01-15',
    status: 'Active',
    email: 'ahmed@thesystem.com',
    phone: '+965 9999 8888',
    salary: 1500,
    nationality: 'Kuwaiti',
    manager: 'Sarah Jones',
    avatar: 'https://i.pravatar.cc/150?u=EMP001'
  },
  {
    id: 'EMP002',
    name: 'Sarah Jones',
    designation: 'Engineering Manager',
    department: 'Engineering',
    joinDate: '2018-05-20',
    status: 'Active',
    email: 'sarah@thesystem.com',
    phone: '+965 6666 5555',
    salary: 2500,
    nationality: 'British',
    manager: 'CEO',
    avatar: 'https://i.pravatar.cc/150?u=EMP002'
  },
  {
    id: 'EMP003',
    name: 'Mohammed Ali',
    designation: 'HR Specialist',
    department: 'Human Resources',
    joinDate: '2021-03-10',
    status: 'Active',
    email: 'mohammed@thesystem.com',
    phone: '+965 5555 4444',
    salary: 1200,
    nationality: 'Egyptian',
    manager: 'HR Manager',
    avatar: 'https://i.pravatar.cc/150?u=EMP003'
  },
  {
    id: 'EMP004',
    name: 'Fatima Al-Otaibi',
    designation: 'Accountant',
    department: 'Finance',
    joinDate: '2019-11-01',
    status: 'On Leave',
    email: 'fatima@thesystem.com',
    phone: '+965 4444 3333',
    salary: 1300,
    nationality: 'Saudi',
    manager: 'Finance Manager',
    avatar: 'https://i.pravatar.cc/150?u=EMP004'
  },
  {
    id: 'EMP005',
    name: 'Ravi Kumar',
    designation: 'Developer',
    department: 'IT',
    joinDate: '2022-07-15',
    status: 'Active',
    email: 'ravi@thesystem.com',
    phone: '+965 3333 2222',
    salary: 1100,
    nationality: 'Indian',
    manager: 'Sarah Jones',
    avatar: 'https://i.pravatar.cc/150?u=EMP005'
  }
];

export const attendance = [
  { id: 1, employeeId: 'EMP001', date: '2025-12-20', checkIn: '08:00', checkOut: '17:00', status: 'Present', late: 0, early: 0, overtime: 0 },
  { id: 2, employeeId: 'EMP001', date: '2025-12-19', checkIn: '08:15', checkOut: '17:00', status: 'Late', late: 15, early: 0, overtime: 0 },
  { id: 3, employeeId: 'EMP001', date: '2025-12-18', checkIn: '08:00', checkOut: '16:30', status: 'Early Departure', late: 0, early: 30, overtime: 0 },
  { id: 4, employeeId: 'EMP002', date: '2025-12-20', checkIn: '07:55', checkOut: '18:00', status: 'Present', late: 0, early: 0, overtime: 60 },
  { id: 5, employeeId: 'EMP003', date: '2025-12-20', checkIn: '08:05', checkOut: '17:05', status: 'Present', late: 5, early: 0, overtime: 0 },
];

export const leaves = [
  { id: 1, employeeId: 'EMP004', type: 'Annual Leave', startDate: '2025-12-15', endDate: '2025-12-25', status: 'Approved', reason: 'Family vacation' },
  { id: 2, employeeId: 'EMP001', type: 'Sick Leave', startDate: '2025-11-10', endDate: '2025-11-11', status: 'Approved', reason: 'Flu' },
  { id: 3, employeeId: 'EMP003', type: 'Emergency Leave', startDate: '2025-12-22', endDate: '2025-12-22', status: 'Pending', reason: 'Personal emergency' },
];

export const payroll = [
  { id: 1, period: 'November 2025', totalEmployees: 50, totalAmount: 75000, status: 'Processed', approvalDate: '2025-11-28' },
  { id: 2, period: 'October 2025', totalEmployees: 48, totalAmount: 72000, status: 'Processed', approvalDate: '2025-10-28' },
  { id: 3, period: 'December 2025', totalEmployees: 50, totalAmount: 75000, status: 'Draft', approvalDate: null },
];

export const recruitment = [
  { id: 1, position: 'Senior Frontend Developer', department: 'IT', applicants: 12, status: 'Interviewing', postedDate: '2025-12-01' },
  { id: 2, position: 'HR Assistant', department: 'Human Resources', applicants: 45, status: 'Screening', postedDate: '2025-12-10' },
  { id: 3, position: 'Sales Manager', department: 'Sales', applicants: 8, status: 'Offer Sent', postedDate: '2025-11-15' },
];

export const policies = [
  { id: 1, name: 'Attendance Policy 2025', version: '2.0', effectiveDate: '2025-01-01', status: 'Active' },
  { id: 2, name: 'Leave Policy', version: '1.5', effectiveDate: '2024-06-01', status: 'Active' },
  { id: 3, name: 'Remote Work Policy', version: '1.0', effectiveDate: '2025-01-01', status: 'Draft' },
];
