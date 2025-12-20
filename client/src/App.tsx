import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MainLayout } from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";

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
    <MainLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/employees" component={() => <PlaceholderPage title="Employee Management" />} />
        <Route path="/attendance" component={() => <PlaceholderPage title="Time & Attendance" />} />
        <Route path="/leaves" component={() => <PlaceholderPage title="Leave Management" />} />
        <Route path="/payroll" component={() => <PlaceholderPage title="Payroll Processing" />} />
        <Route path="/recruitment" component={() => <PlaceholderPage title="Recruitment Pipeline" />} />
        <Route path="/documents" component={() => <PlaceholderPage title="Document Management" />} />
        <Route path="/analytics" component={() => <PlaceholderPage title="Analytics & Reports" />} />
        <Route path="/admin" component={() => <PlaceholderPage title="Admin & Governance" />} />
        <Route path="/settings" component={() => <PlaceholderPage title="System Settings" />} />
        
        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
