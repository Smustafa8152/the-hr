# The System - HRMS Implementation Guide

## 🏗️ Architecture Overview

This HRMS is built with a modern full-stack architecture:

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + tRPC + Drizzle ORM
- **Database**: MySQL
- **Routing**: Wouter (client-side)
- **State Management**: React hooks + tRPC React Query

## 📁 Project Structure

```
the-system-hr-frontend/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API service layers
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main app with routes
├── server/                  # Backend tRPC server
│   ├── hrRouter.ts         # HR operations router
│   ├── routers.ts          # Main router registry
│   └── db.ts               # Database connection
├── drizzle/                # Database schema and migrations
│   ├── schema.ts           # Table definitions
│   └── migrations/         # SQL migration files
└── shared/                 # Shared types between client/server
```

## 🗄️ Database Schema

### Core Tables

#### 1. **employees**
```typescript
{
  id: int (primary key, auto-increment)
  employeeId: varchar(50) unique
  firstName: varchar(100)
  lastName: varchar(100)
  email: varchar(320) unique
  phone: varchar(20)
  department: varchar(100)
  position: varchar(100)
  hireDate: timestamp
  salary: decimal(10,2)
  status: enum('Active', 'Inactive', 'On Leave')
  employmentType: enum('Full Time', 'Part Time', 'Consultant')
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 2. **attendance**
```typescript
{
  id: int (primary key)
  employeeId: int (foreign key)
  date: timestamp
  checkIn: timestamp
  checkOut: timestamp
  status: enum('Present', 'Absent', 'Late', 'Half Day', 'On Leave')
  notes: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 3. **leaves**
```typescript
{
  id: int (primary key)
  employeeId: int (foreign key)
  leaveType: varchar(50)
  startDate: timestamp
  endDate: timestamp
  reason: text
  status: enum('Pending', 'Approved', 'Rejected')
  approvedBy: int
  approvedAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4. **payroll**
```typescript
{
  id: int (primary key)
  employeeId: int (foreign key)
  month: varchar(7) // Format: YYYY-MM
  basicSalary: decimal(10,2)
  allowances: decimal(10,2)
  deductions: decimal(10,2)
  netSalary: decimal(10,2)
  status: enum('Draft', 'Processed', 'Paid')
  paidAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 5. **hiringChecklists**
```typescript
{
  id: int (primary key)
  employeeId: int (foreign key, unique)
  stage: int (1-6)
  progressPercentage: int (0-100)
  status: enum('In Progress', 'Pending Approval', 'Completed')
  hrApproved: boolean
  hrApprovedBy: varchar(200)
  hrApprovedDate: timestamp
  managerApproved: boolean
  managerApprovedBy: varchar(200)
  managerApprovedDate: timestamp
  items: json // Array of checklist items
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 6. **roles**
```typescript
{
  id: int (primary key)
  name: varchar(100) unique
  description: text
  isSystemRole: boolean
  permissions: json // Permission matrix
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 7. **userRoles**
```typescript
{
  id: int (primary key)
  userId: int (foreign key)
  roleId: int (foreign key)
  effectiveDate: timestamp
  assignedBy: varchar(200)
  assignedAt: timestamp
}
```

#### 8. **auditLogs**
```typescript
{
  id: int (primary key)
  action: varchar(100)
  entityType: varchar(100)
  entityId: varchar(100)
  changes: json
  performedBy: varchar(200)
  performedAt: timestamp
}
```

## 🔌 tRPC API Endpoints

### Employee Operations
- `hr.employees.list` - Get all employees
- `hr.employees.getById(id)` - Get employee by ID
- `hr.employees.create(data)` - Create new employee
- `hr.employees.update(id, data)` - Update employee
- `hr.employees.delete(id)` - Delete employee

### Attendance Operations
- `hr.attendance.list` - Get all attendance records
- `hr.attendance.create(data)` - Create attendance record
- `hr.attendance.update(id, data)` - Update attendance record

### Leave Operations
- `hr.leaves.list` - Get all leave requests
- `hr.leaves.create(data)` - Create leave request
- `hr.leaves.update(id, data)` - Update leave status

### Payroll Operations
- `hr.payroll.list` - Get all payroll records
- `hr.payroll.create(data)` - Create payroll record
- `hr.payroll.update(id, data)` - Update payroll status

### Hiring Checklist Operations
- `hr.hiringChecklists.list` - Get all checklists
- `hr.hiringChecklists.getByEmployeeId(id)` - Get checklist for employee
- `hr.hiringChecklists.create(data)` - Create new checklist
- `hr.hiringChecklists.update(id, data)` - Update checklist

### Role & Permission Operations
- `hr.roles.list` - Get all roles
- `hr.roles.create(data)` - Create new role
- `hr.roles.update(id, data)` - Update role
- `hr.roles.delete(id)` - Delete role
- `hr.userRoles.list` - Get all user role assignments
- `hr.userRoles.assign(data)` - Assign role to user
- `hr.userRoles.remove(id)` - Remove role assignment

### Audit Log Operations
- `hr.auditLogs.list` - Get audit logs (last 100)
- `hr.auditLogs.create(data)` - Create audit log entry

## 🚀 Key Features Implemented

### 1. Employment Type Management
- Three employment types: Full Time, Part Time, Consultant
- Role-based navigation visibility
- Consultants excluded from attendance tracking
- Employment type badges on employee cards

### 2. Hiring Process Checklist
- 6-stage onboarding process:
  1. Offer & Acceptance
  2. Documents & Contract
  3. Pre-Onboarding
  4. First Day
  5. Probation Period
  6. Final Confirmation
- Progress tracking with percentage
- Dual approval system (HR + Manager)
- Status tracking: In Progress → Pending Approval → Completed

### 3. Global Role & Permission System
- 5 predefined system roles:
  - **Admin**: Full system access
  - **HR**: Employee and attendance management
  - **Manager**: Team oversight with approval rights
  - **Finance**: Payroll access
  - **Supervisor**: Limited approval rights
- Custom role creation
- Permission matrix: 6 modules × 6 actions
  - Modules: HR, Attendance, Payroll, Recruitment, Analytics, Settings
  - Actions: View, Create, Edit, Approve, Delete, Export
- User role assignment with effective dates
- Audit logging for all permission changes

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Generate database migrations
pnpm db:push

# Run TypeScript checks
pnpm exec tsc --noEmit

# Build for production
pnpm build
```

## 📝 Database Migration

To apply the database schema:

```bash
cd the-system-hr-frontend
pnpm db:push
```

This will:
1. Generate SQL migrations from `drizzle/schema.ts`
2. Apply migrations to the MySQL database
3. Create all 12 tables with proper relationships

## 🔐 Environment Variables

Required environment variables (automatically configured by Manus):
- `DATABASE_URL` - MySQL connection string
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Application logo URL
- `JWT_SECRET` - JWT signing secret
- `OAUTH_SERVER_URL` - OAuth server URL

## 📊 Current Status

### ✅ Completed
- Database schema with 12 tables
- tRPC server routers for all operations
- Frontend pages for all modules
- Employment type feature
- Hiring checklist module
- Roles & permissions system
- TypeScript error-free codebase

### 🚧 In Progress
- Frontend services using mock data (4 sample employees)
- Need to connect services to tRPC endpoints

### 📋 Next Steps
1. Seed database with sample data
2. Connect frontend services to tRPC
3. Add authentication checks
4. Implement permission enforcement
5. Add data export features (Excel/PDF)

## 🎨 Design System

The application uses a modern dark theme with:
- **Primary Color**: Blue (#3B82F6)
- **Background**: Dark navy (#0A0E1A)
- **Cards**: Semi-transparent with blur effects
- **Typography**: Inter for body, custom heading font
- **Components**: shadcn/ui with Tailwind CSS 4

## 📱 Responsive Design

All pages are fully responsive with:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar navigation
- Touch-friendly UI elements

## 🧪 Testing

To add tests for the HR router:

```typescript
// server/hrRouter.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('HR Router', () => {
  it('should list employees', async () => {
    const caller = appRouter.createCaller({});
    const employees = await caller.hr.employees.list();
    expect(Array.isArray(employees)).toBe(true);
  });
});
```

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [tRPC Documentation](https://trpc.io/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/)

---

**Last Updated**: December 21, 2025
**Version**: 41e9d769
