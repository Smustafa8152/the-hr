import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import EmployeeListPage from "./pages/EmployeeListPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import AttendancePage from "./pages/AttendancePage";
import PayrollPage from "./pages/PayrollPage";
import SetupPage from "./pages/SetupPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import ESSPage from "./pages/ESSPage";
import TimesheetsPage from "./pages/TimesheetsPage";
import LeavesPage from "./pages/LeavesPage";
import DocumentsPage from "./pages/DocumentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import HiringChecklistPage from "./pages/HiringChecklistPage";
import RolesPermissionsPage from "./pages/RolesPermissionsPage";
import './utils/i18n';

// Placeholder pages for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">🚧</div>
    <h2 className="text-2xl font-bold font-heading">{title}</h2>
    <p className="text-muted-foreground max-w-md">This module is currently under development. Check back soon for the full implementation.</p>
  </div>
);
function Router() {
  return (
    <Switch>
      {/* Public route */}
      <Route path="/login" component={LoginPage} />
      
      {/* Protected routes */}
      <Route path="/">
        <ProtectedRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/employees">
        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
          <MainLayout>
            <EmployeeListPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/employees/:id">
        <ProtectedRoute requiredRole={['super_admin', 'admin', 'employee']}>
          <MainLayout>
            <EmployeeDetailPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/attendance">
        <ProtectedRoute requiredRole={['super_admin', 'admin', 'employee']}>
          <MainLayout>
            <AttendancePage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/payroll">
        <ProtectedRoute requiredRole={['super_admin', 'admin', 'employee']}>
          <MainLayout>
            <PayrollPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/leaves">
        <ProtectedRoute requiredRole={['super_admin', 'admin', 'employee']}>
          <MainLayout>
            <LeavesPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/ess">
        <ProtectedRoute requiredRole={['super_admin', 'admin', 'employee']}>
          <MainLayout>
            <ESSPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/timesheets">
        <ProtectedRoute requiredRole={['super_admin', 'admin', 'employee']}>
          <MainLayout>
            <TimesheetsPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/documents">
        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
          <MainLayout>
            <DocumentsPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/recruitment">
        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
          <MainLayout>
            <RecruitmentPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/hiring-checklist">
        <ProtectedRoute requiredRole={['super_admin', 'admin', 'employee']}>
          <MainLayout>
            <HiringChecklistPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/analytics">
        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
          <MainLayout>
            <AnalyticsPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
          <MainLayout>
            <AdminPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
          <MainLayout>
            <SettingsPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/roles-permissions">
        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
          <MainLayout>
            <RolesPermissionsPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
