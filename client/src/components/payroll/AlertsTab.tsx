import { useState } from 'react';
import { AlertCircle, CheckCircle, X, Bell, Clock, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Mock alerts data
const mockAlerts = [
  {
    id: 1,
    type: 'Overdue',
    severity: 'Critical',
    employeeId: 'EMP003',
    employeeName: 'Mike Johnson',
    department: 'Marketing',
    returnAmount: 1953,
    dueDate: '2024-12-28',
    daysOverdue: 1,
    message: 'Return payment is 1 day overdue',
    status: 'Active',
    createdAt: '2024-12-29 09:00',
  },
  {
    id: 2,
    type: 'Reminder',
    severity: 'High',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'Engineering',
    returnAmount: 1900,
    dueDate: '2024-12-31',
    daysLeft: 2,
    message: 'Return payment due in 2 days',
    status: 'Active',
    createdAt: '2024-12-29 08:00',
  },
  {
    id: 3,
    type: 'Reminder',
    severity: 'Medium',
    employeeId: 'EMP004',
    employeeName: 'Sarah Williams',
    department: 'Sales',
    returnAmount: 1650,
    dueDate: '2024-12-31',
    daysLeft: 2,
    message: 'Return payment due in 2 days',
    status: 'Active',
    createdAt: '2024-12-29 08:00',
  },
  {
    id: 4,
    type: 'Pending',
    severity: 'Low',
    employeeId: 'EMP005',
    employeeName: 'David Brown',
    department: 'Engineering',
    returnAmount: 2100,
    dueDate: '2024-12-31',
    daysLeft: 2,
    message: 'Return payment pending',
    status: 'Acknowledged',
    createdAt: '2024-12-28 10:00',
    acknowledgedAt: '2024-12-29 11:00',
  },
];

export default function AlertsTab() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  const handleAcknowledge = (alertId: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? ({
              ...alert,
              status: 'Acknowledged',
              acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            } as any)
          : alert
      )
    );
    toast.success('Alert acknowledged');
  };

  const handleDismiss = (alertId: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? ({
              ...alert,
              status: 'Dismissed',
            } as any)
          : alert
      )
    );
    toast.success('Alert dismissed');
  };

  const handleResolve = (alertId: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? ({
              ...alert,
              status: 'Resolved',
              resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            } as any)
          : alert
      )
    );
    toast.success('Alert resolved');
  };

  // Calculate statistics
  const activeAlerts = alerts.filter((a) => a.status === 'Active').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'Critical' && a.status === 'Active').length;
  const overdueAlerts = alerts.filter((a) => a.type === 'Overdue' && a.status === 'Active').length;
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'Acknowledged').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/20 text-red-700 border-red-500';
      case 'High':
        return 'bg-orange-500/20 text-orange-700 border-orange-500';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-700 border-amber-500';
      case 'Low':
        return 'bg-blue-500/20 text-blue-700 border-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-red-500/20 text-red-700 border-red-500';
      case 'Acknowledged':
        return 'bg-amber-500/20 text-amber-700 border-amber-500';
      case 'Resolved':
        return 'bg-green-500/20 text-green-700 border-green-500';
      case 'Dismissed':
        return 'bg-gray-500/20 text-gray-700 border-gray-500';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
            </div>
            <Bell className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-orange-600">{overdueAlerts}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Acknowledged</p>
              <p className="text-2xl font-bold text-amber-600">{acknowledgedAlerts}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-amber-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Acknowledged">Acknowledged</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 ${
              alert.severity === 'Critical' && alert.status === 'Active'
                ? 'border-red-500/50 bg-red-500/5'
                : alert.severity === 'High' && alert.status === 'Active'
                ? 'border-orange-500/50 bg-orange-500/5'
                : ''
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  alert.severity === 'Critical'
                    ? 'bg-red-500/20'
                    : alert.severity === 'High'
                    ? 'bg-orange-500/20'
                    : alert.severity === 'Medium'
                    ? 'bg-amber-500/20'
                    : 'bg-blue-500/20'
                }`}
              >
                {alert.type === 'Overdue' ? (
                  <AlertCircle
                    className={`w-5 h-5 ${
                      alert.severity === 'Critical'
                        ? 'text-red-600'
                        : alert.severity === 'High'
                        ? 'text-orange-600'
                        : alert.severity === 'Medium'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  />
                ) : (
                  <Clock
                    className={`w-5 h-5 ${
                      alert.severity === 'Critical'
                        ? 'text-red-600'
                        : alert.severity === 'High'
                        ? 'text-orange-600'
                        : alert.severity === 'Medium'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.employeeName}</h4>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.employeeId} • {alert.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">${alert.returnAmount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Due: {alert.dueDate}</p>
                  </div>
                </div>

                <p className="text-sm mb-3">{alert.message}</p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Created: {alert.createdAt}</p>
                  {alert.status === 'Active' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                      <Button size="sm" onClick={() => handleResolve(alert.id)}>
                        Resolve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDismiss(alert.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  {alert.status === 'Acknowledged' && alert.acknowledgedAt && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Acknowledged: {alert.acknowledgedAt}</p>
                      <Button size="sm" onClick={() => handleResolve(alert.id)}>
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h4 className="font-semibold mb-2">No Alerts Found</h4>
          <p className="text-sm text-muted-foreground">
            {statusFilter === 'all' && severityFilter === 'all'
              ? 'All return payments are on track!'
              : 'Try adjusting your filters to see more alerts.'}
          </p>
        </Card>
      )}
    </div>
  );
}
