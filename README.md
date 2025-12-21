# The System - Enterprise HR Management System

<div align="center">

![The System Logo](https://img.shields.io/badge/The%20System-HRMS-blue?style=for-the-badge)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=flat&logo=trpc)](https://trpc.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

A modern, full-stack enterprise HR management system built with cutting-edge technologies.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 🌟 Features

### Core HR Management
- ✅ **Employee Management** - Complete CRUD operations with employment type tracking
- ✅ **Attendance Tracking** - Clock in/out with status management
- ✅ **Leave Management** - Request, approve, and track employee leaves
- ✅ **Payroll Processing** - Salary calculations with allowances and deductions
- ✅ **Recruitment Pipeline** - Track candidates from application to hire
- ✅ **Timesheet Management** - Project-based time tracking
- ✅ **Document Management** - Store and manage employee documents

### Advanced Features
- 🎯 **Hiring Process Checklist** - 6-stage onboarding workflow with dual approval
- 🔐 **Role & Permission System** - Granular access control with 5 system roles
- 📊 **Analytics Dashboard** - Real-time insights and reporting
- 🌍 **Multi-language Support** - i18n ready (English/Arabic)
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI/UX** - Dark theme with glassmorphism effects

### Employment Types
- **Full Time** - Access to all modules
- **Part Time** - Limited module access
- **Consultant** - Restricted access (no attendance tracking)

### Hiring Checklist Stages
1. Offer & Acceptance
2. Documents & Contract
3. Pre-Onboarding
4. First Day
5. Probation Period
6. Final Confirmation

### Permission System
- **6 Modules**: HR, Attendance, Payroll, Recruitment, Analytics, Settings
- **6 Actions**: View, Create, Edit, Approve, Delete, Export
- **5 System Roles**: Admin, HR, Manager, Finance, Supervisor
- **Custom Roles**: Create roles with specific permissions
- **Audit Logging**: Track all permission changes

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Wouter** - Lightweight client-side routing
- **shadcn/ui** - High-quality UI components
- **Lucide Icons** - Beautiful icon library
- **i18next** - Internationalization

### Backend
- **Node.js** - JavaScript runtime
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM
- **MySQL** - Relational database
- **Zod** - Schema validation

### DevOps
- **Vite** - Fast build tool
- **pnpm** - Efficient package manager
- **GitHub Actions** - CI/CD (coming soon)
- **Docker** - Containerization (coming soon)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- MySQL 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/salemsharhan/the-system-hr-frontend.git
   cd the-system-hr-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📚 Documentation

- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Architecture and database schema
- [Code Export](./CODE_EXPORT.md) - Complete code reference
- [API Documentation](./docs/API.md) - tRPC endpoints (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment (coming soon)

---

## 📁 Project Structure

```
the-system-hr-frontend/
├── client/                     # Frontend application
│   ├── public/                # Static assets
│   └── src/
│       ├── pages/             # Page components
│       │   ├── Dashboard.tsx
│       │   ├── EmployeeListPage.tsx
│       │   ├── HiringChecklistPage.tsx
│       │   └── RolesPermissionsPage.tsx
│       ├── components/        # Reusable components
│       │   ├── common/        # Common UI components
│       │   └── layout/        # Layout components
│       ├── services/          # API service layers
│       │   ├── employeeService.ts
│       │   ├── hiringChecklistService.ts
│       │   └── rolesPermissionsService.ts
│       ├── lib/               # Utilities
│       └── App.tsx            # Main app component
├── server/                    # Backend application
│   ├── hrRouter.ts           # HR operations router
│   ├── routers.ts            # Main router
│   └── db.ts                 # Database connection
├── drizzle/                  # Database layer
│   ├── schema.ts             # Table definitions
│   └── migrations/           # SQL migrations
├── shared/                   # Shared types
└── docs/                     # Documentation
```

---

## 🗄️ Database Schema

The system uses 12 tables:

1. **users** - Authentication and user management
2. **employees** - Employee records
3. **attendance** - Attendance tracking
4. **leaves** - Leave requests
5. **payroll** - Salary and payments
6. **recruitment** - Candidate pipeline
7. **timesheets** - Time tracking
8. **documents** - Document storage
9. **hiringChecklists** - Onboarding workflow
10. **roles** - Role definitions
11. **userRoles** - Role assignments
12. **auditLogs** - Activity tracking

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed schema.

---

## 🎨 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Employee Management
![Employees](./screenshots/employees.png)

### Hiring Checklist
![Hiring Checklist](./screenshots/hiring-checklist.png)

### Roles & Permissions
![Roles](./screenshots/roles-permissions.png)

---

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Database
pnpm db:push          # Generate and apply migrations
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Run tests
pnpm test:ui          # Run tests with UI

# Linting
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript checks
```

### Database Migrations

```bash
# Generate migration
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit migrate

# Or use the combined command
pnpm db:push
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Salem Sharhan**
- GitHub: [@salemsharhan](https://github.com/salemsharhan)

---

## 🙏 Acknowledgments

- Built with [Manus](https://manus.im) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📊 Project Status

- ✅ Database schema implemented
- ✅ tRPC server routers created
- ✅ Frontend pages completed
- ✅ Employment type feature
- ✅ Hiring checklist module
- ✅ Roles & permissions system
- 🚧 Frontend-backend integration (in progress)
- 🚧 Authentication implementation
- 📋 Testing suite
- 📋 Deployment configuration

---

## 🗺️ Roadmap

- [ ] Connect frontend services to tRPC endpoints
- [ ] Seed database with sample data
- [ ] Add authentication and authorization
- [ ] Implement permission enforcement
- [ ] Add data export features (Excel/PDF)
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] API documentation with Swagger
- [ ] Docker deployment

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Salem Sharhan](https://github.com/salemsharhan)

</div>
