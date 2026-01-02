import { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, DollarSign, AlertCircle, Download, Eye, FileText, Save, Send } from 'lucide-react';
import { selfServiceApi, Request, Payslip } from '../services/selfServiceApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { SubmitRequestModal } from '../components/selfservice/SubmitRequestModal';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { getEmployeeLeaveBalance } from '../services/leaveBalanceService';
import { attendanceService } from '../services/attendanceService';
import { timesheetService, TimesheetEntry } from '../services/timesheetService';
import Modal from '../components/common/Modal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/common/UIComponents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    checkInTime: '--:--' as string | null,
    leaveBalance: 0,
    nextPayday: 'TBD' as string | null,
    pendingRequestsCount: 0
  });
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [recentPayslips, setRecentPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [todayTimesheet, setTodayTimesheet] = useState<TimesheetEntry | null>(null);
  const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
  const [isSubmittingTimesheet, setIsSubmittingTimesheet] = useState(false);
  const [timesheetForm, setTimesheetForm] = useState({
    hours_worked: 0,
    description: '',
    project_name: '',
    task_type: ''
  });

  // Get employee name from session storage or user
  const employeeFirstName = user ? 
    (sessionStorage.getItem('employee_data') 
      ? JSON.parse(sessionStorage.getItem('employee_data') || '{}')?.first_name || 'Employee'
      : (user as any)?.first_name || 'Employee')
    : 'Employee';

  useEffect(() => {
    loadDashboardData();
    loadTodayTimesheet();
  }, []);

  useEffect(() => {
    if (todayTimesheet) {
      setTimesheetForm({
        hours_worked: todayTimesheet.hours_worked || 0,
        description: todayTimesheet.description || '',
        project_name: todayTimesheet.project_name || '',
        task_type: todayTimesheet.task_type || ''
      });
    }
  }, [todayTimesheet]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get employee ID from user or session storage
      const employeeId = user?.employee_id || 
        (sessionStorage.getItem('employee_data') 
          ? JSON.parse(sessionStorage.getItem('employee_data') || '{}')?.id 
          : null);
      
      const companyId = user?.company_id || 
        (sessionStorage.getItem('employee_data') 
          ? JSON.parse(sessionStorage.getItem('employee_data') || '{}')?.company_id 
          : null);

      if (!employeeId || !companyId) {
        console.warn('Employee ID or Company ID not found');
        setLoading(false);
        return;
      }

      // Fetch real data
      const [leaveBalance, attendanceLogs, allRequests, recentRequests, payslips] = await Promise.all([
        getEmployeeLeaveBalance(employeeId, companyId),
        attendanceService.getByEmployee(employeeId),
        selfServiceApi.getAllRequests(),
        selfServiceApi.getRecentRequests(5),
        selfServiceApi.getRecentPayslips(3)
      ]);

      // Get today's check-in time
      const today = new Date().toISOString().split('T')[0];
      const todayLog = attendanceLogs.find(log => log.date === today);
      const checkInTime = todayLog?.checkIn 
        ? new Date(todayLog.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

      // Calculate total leave balance (annual + sick + emergency)
      const totalLeaveBalance = leaveBalance 
        ? (leaveBalance.annual_leave.available + leaveBalance.sick_leave.available + leaveBalance.emergency_leave.available)
        : 0;

      // Count pending requests
      const pendingRequestsCount = allRequests.filter(r => 
        r.status === 'Pending' || r.status === 'In Review'
      ).length;

      // Get next payday (for now, using a placeholder - would need payroll service)
      const nextPayday = 'TBD'; // TODO: Implement payroll service to get actual next payday

      setDashboardData({
        checkInTime,
        leaveBalance: Math.floor(totalLeaveBalance),
        nextPayday,
        pendingRequestsCount
      });
      setRecentRequests(recentRequests);
      setRecentPayslips(payslips);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmitted = () => {
    // Refresh dashboard data after request submission
    loadDashboardData();
    toast.success('Request submitted successfully!');
  };

  const loadTodayTimesheet = async () => {
    const employeeId = user?.employee_id || 
      (sessionStorage.getItem('employee_data') 
        ? JSON.parse(sessionStorage.getItem('employee_data') || '{}')?.id 
        : null);
    
    if (!employeeId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const entry = await timesheetService.getByDate(employeeId, today);
      setTodayTimesheet(entry);
    } catch (error) {
      console.error('Failed to load today timesheet:', error);
    }
  };

  const handleSaveTimesheet = async () => {
    const employeeId = user?.employee_id || 
      (sessionStorage.getItem('employee_data') 
        ? JSON.parse(sessionStorage.getItem('employee_data') || '{}')?.id 
        : null);
    
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    if (timesheetForm.hours_worked <= 0) {
      toast.error('Please enter hours worked');
      return;
    }

    try {
      setIsSubmittingTimesheet(true);
      const today = new Date().toISOString().split('T')[0];
      await timesheetService.upsert({
        employee_id: employeeId,
        date: today,
        hours_worked: timesheetForm.hours_worked,
        description: timesheetForm.description,
        project_name: timesheetForm.project_name,
        task_type: timesheetForm.task_type
      });
      toast.success('Timesheet saved successfully!');
      await loadTodayTimesheet();
      setIsTimesheetModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save timesheet:', error);
      toast.error(error.message || 'Failed to save timesheet');
    } finally {
      setIsSubmittingTimesheet(false);
    }
  };

  const handleSubmitTimesheetReport = async (type: 'daily' | 'weekly') => {
    const employeeId = user?.employee_id || 
      (sessionStorage.getItem('employee_data') 
        ? JSON.parse(sessionStorage.getItem('employee_data') || '{}')?.id 
        : null);
    
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    try {
      setIsSubmittingTimesheet(true);
      
      if (type === 'daily') {
        // First save if not saved
        if (!todayTimesheet) {
          const today = new Date().toISOString().split('T')[0];
          await timesheetService.upsert({
            employee_id: employeeId,
            date: today,
            hours_worked: timesheetForm.hours_worked,
            description: timesheetForm.description,
            project_name: timesheetForm.project_name,
            task_type: timesheetForm.task_type
          });
        }
        
        const today = new Date().toISOString().split('T')[0];
        await timesheetService.submitDaily(employeeId, today);
        toast.success('Daily timesheet report submitted successfully!');
      } else {
        // Weekly submission
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek); // Get Sunday of current week
        const weekStartDate = weekStart.toISOString().split('T')[0];
        
        await timesheetService.submitWeekly(employeeId, weekStartDate);
        toast.success('Weekly timesheet report submitted successfully!');
      }
      
      await loadTodayTimesheet();
      setIsTimesheetModalOpen(false);
    } catch (error: any) {
      console.error('Failed to submit timesheet report:', error);
      toast.error(error.message || 'Failed to submit timesheet report');
    } finally {
      setIsSubmittingTimesheet(false);
    }
  };

  const KPICard = ({ icon: Icon, title, value, trend }: any) => (
    <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Welcome Header - Mobile App Style */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back!</h1>
        <p className="text-muted-foreground text-sm">{employeeFirstName}</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Submit Request
        </button>
        <button
          onClick={() => setIsTimesheetModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Clock className="w-4 h-4" />
          {todayTimesheet ? 'Edit Timesheet' : 'Log Time'}
        </button>
      </div>

      {/* KPI Cards - Mobile App Style (2 columns) */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          icon={Clock}
          title="Check-in Time"
          value={dashboardData.checkInTime || '--:--'}
          trend="+2.5%"
        />
        <KPICard
          icon={Calendar}
          title="Leave Balance"
          value={`${dashboardData.leaveBalance} Days`}
        />
        <KPICard
          icon={DollarSign}
          title="Next Payday"
          value={dashboardData.nextPayday || 'TBD'}
        />
        <KPICard
          icon={AlertCircle}
          title="Pending Requests"
          value={dashboardData.pendingRequestsCount}
          trend={dashboardData.pendingRequestsCount > 0 ? '-5%' : undefined}
        />
      </div>

      {/* Two Panels - Mobile App Style (Stacked) */}
      <div className="space-y-4">
        {/* Recent Payslips */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Recent Payslips</h2>
            <a href="/self-service/payslips" className="text-xs text-primary hover:underline font-medium">
              View All
            </a>
          </div>

          {recentPayslips.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No payslips available"
              description="Your payslips will appear here once generated"
            />
          ) : (
            <div className="space-y-3">
              {recentPayslips.map(payslip => (
                <div
                  key={payslip.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors mb-2"
                >
                  <div>
                    <p className="font-medium text-sm text-foreground">{payslip.month}</p>
                    <p className="text-xs text-muted-foreground">
                      Net: ${payslip.netSalary.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => window.open(payslip.downloadUrl, '_blank')}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => selfServiceApi.downloadPayslip(payslip.id)}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">My Requests</h2>
            <a href="/self-service/requests" className="text-xs text-primary hover:underline font-medium">
              View All
            </a>
          </div>

          {recentRequests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No recent requests"
              description="Your submitted requests will appear here"
              action={{
                label: 'Submit Request',
                onClick: () => setIsSubmitModalOpen(true)
              }}
            />
          ) : (
            <div className="space-y-3">
              {recentRequests.map(request => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer mb-2"
                  onClick={() => window.location.href = `/self-service/requests/${request.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{request.type}</p>
                    <p className="text-xs text-muted-foreground">{request.date}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timesheet Entry Card */}
      {todayTimesheet && (
        <div className="bg-card border border-border rounded-2xl p-3 md:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h2 className="text-sm md:text-base font-semibold text-foreground">Today's Timesheet</h2>
            <StatusBadge status={todayTimesheet.is_submitted ? 'Completed' : 'Draft'} />
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-muted-foreground">Hours Worked</span>
              <span className="font-semibold text-sm md:text-base">{todayTimesheet.hours_worked}h</span>
            </div>
            {todayTimesheet.description && (
              <div className="text-xs md:text-sm">
                <span className="text-muted-foreground">Description: </span>
                <span className="line-clamp-2">{todayTimesheet.description}</span>
              </div>
            )}
            {todayTimesheet.project_name && (
              <div className="text-xs md:text-sm">
                <span className="text-muted-foreground">Project: </span>
                <span>{todayTimesheet.project_name}</span>
              </div>
            )}
            {todayTimesheet.task_type && (
              <div className="text-xs md:text-sm">
                <span className="text-muted-foreground">Type: </span>
                <span>{todayTimesheet.task_type}</span>
              </div>
            )}
          </div>
          {!todayTimesheet.is_submitted && (
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setIsTimesheetModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Edit
              </button>
                <button
                  onClick={() => handleSubmitTimesheetReport('daily')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  Submit Report
                </button>
              </div>
            )}
        </div>
      )}

      {/* Submit Request Modal */}
      <SubmitRequestModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleRequestSubmitted}
      />

      {/* Timesheet Entry Modal */}
      <Modal
        isOpen={isTimesheetModalOpen}
        onClose={() => setIsTimesheetModalOpen(false)}
        title={todayTimesheet ? 'Edit Timesheet Entry' : 'Log Time Today'}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Hours Worked *</Label>
            <Input
              type="number"
              step="0.25"
              min="0"
              max="24"
              value={timesheetForm.hours_worked}
              onChange={(e) => setTimesheetForm({ ...timesheetForm, hours_worked: parseFloat(e.target.value) || 0 })}
              placeholder="8.5"
            />
            <p className="text-xs text-muted-foreground">Enter hours worked today (e.g., 8.5 for 8 hours 30 minutes)</p>
          </div>

          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={timesheetForm.project_name}
              onChange={(e) => setTimesheetForm({ ...timesheetForm, project_name: e.target.value })}
              placeholder="Project name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select
              value={timesheetForm.task_type}
              onValueChange={(value) => setTimesheetForm({ ...timesheetForm, task_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Testing">Testing</SelectItem>
                <SelectItem value="Documentation">Documentation</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={timesheetForm.description}
              onChange={(e) => setTimesheetForm({ ...timesheetForm, description: e.target.value })}
              placeholder="What work did you do today? (optional)"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsTimesheetModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTimesheet}
              disabled={isSubmittingTimesheet || timesheetForm.hours_worked <= 0}
              className="flex-1"
            >
              {isSubmittingTimesheet ? 'Saving...' : 'Save Timesheet'}
            </Button>
            {!todayTimesheet?.is_submitted && (
              <Button
                onClick={() => handleSubmitTimesheetReport('daily')}
                disabled={isSubmittingTimesheet || timesheetForm.hours_worked <= 0}
                variant="secondary"
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Save & Submit
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
