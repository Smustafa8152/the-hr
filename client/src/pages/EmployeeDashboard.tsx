import { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, DollarSign, AlertCircle, Download, Eye, FileText } from 'lucide-react';
import { selfServiceApi, Request, Payslip } from '../services/selfServiceApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { SubmitRequestModal } from '../components/selfservice/SubmitRequestModal';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
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

  const employeeFirstName = 'Admin'; // TODO: Get from auth context

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, requests, payslips] = await Promise.all([
        selfServiceApi.getDashboardData(),
        selfServiceApi.getRecentRequests(5),
        selfServiceApi.getRecentPayslips(3)
      ]);

      setDashboardData(dashboard);
      setRecentRequests(requests);
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

  const KPICard = ({ icon: Icon, title, value, trend }: any) => (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {employeeFirstName}</p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Submit Request
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payslips */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Payslips</h2>
            <a href="/self-service/payslips" className="text-sm text-primary hover:underline">
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
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{payslip.month}</p>
                    <p className="text-sm text-muted-foreground">
                      Net: ${payslip.netSalary.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">My Requests</h2>
            <a href="/self-service/requests" className="text-sm text-primary hover:underline">
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
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/self-service/requests/${request.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{request.type}</p>
                    <p className="text-sm text-muted-foreground">{request.date}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Request Modal */}
      <SubmitRequestModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleRequestSubmitted}
      />
    </div>
  );
}
