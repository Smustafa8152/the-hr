import { useState } from 'react';
import { DollarSign, Users, AlertCircle, CheckCircle, TrendingUp, Calendar, FileText, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import GeneratePayrollTab from '@/components/payroll/GeneratePayrollTab';
import PayslipsTab from '@/components/payroll/PayslipsTab';
import ReturnTrackingTab from '@/components/payroll/ReturnTrackingTab';
import AlertsTab from '@/components/payroll/AlertsTab';
import ReportsTab from '@/components/payroll/ReportsTab';

// Mock data for demonstration
const mockStats = {
  totalPayroll: 1420000,
  totalEmployees: 248,
  pendingReturns: 15,
  completedReturns: 233,
  overdueReturns: 3,
  currentMonth: 'December 2024',
};

const mockRecentPayrolls = [
  { id: 1, period: 'December 2024', employees: 248, gross: 1420000, net: 992000, bankTransfer: 1240000, returns: 248000, status: 'Completed', date: '2024-12-25' },
  { id: 2, period: 'November 2024', employees: 245, gross: 1380000, net: 966000, bankTransfer: 1210000, returns: 244000, status: 'Completed', date: '2024-11-25' },
  { id: 3, period: 'October 2024', employees: 242, gross: 1350000, net: 945000, bankTransfer: 1185000, returns: 240000, status: 'Completed', date: '2024-10-25' },
];

const mockPendingReturns = [
  { id: 1, employee: 'John Doe', employeeId: 'EMP001', amount: 1000, dueDate: '2024-12-31', daysLeft: 2, status: 'Pending' },
  { id: 2, employee: 'Jane Smith', employeeId: 'EMP002', amount: 1200, dueDate: '2024-12-31', daysLeft: 2, status: 'Pending' },
  { id: 3, employee: 'Mike Johnson', employeeId: 'EMP003', amount: 800, dueDate: '2024-12-28', daysLeft: -1, status: 'Overdue' },
];

export default function PayrollManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-muted-foreground">
            Manage payroll, track returns, and monitor compliance adjustments
          </p>
        </div>
        <Button size="lg">
          <DollarSign className="w-5 h-5 mr-2" />
          Generate Payroll
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Payroll</p>
              <p className="text-3xl font-bold">${(mockStats.totalPayroll / 1000).toFixed(0)}k</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5.2% from last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
              <p className="text-3xl font-bold">{mockStats.totalEmployees}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Active employees
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Returns</p>
              <p className="text-3xl font-bold">{mockStats.pendingReturns}</p>
              <p className="text-xs text-amber-600 mt-2">
                {mockStats.overdueReturns} overdue
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completed Returns</p>
              <p className="text-3xl font-bold">{mockStats.completedReturns}</p>
              <p className="text-xs text-green-600 mt-2">
                94% completion rate
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Payroll</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="returns">Return Tracking</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {mockStats.overdueReturns > 0 && (
              <Badge variant="destructive" className="ml-2">
                {mockStats.overdueReturns}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Payroll Runs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Recent Payroll Runs</h4>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employees</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Gross Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Net Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bank Transfer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Return Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentPayrolls.map((payroll) => (
                    <tr key={payroll.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{payroll.period}</td>
                      <td className="py-3 px-4">{payroll.employees}</td>
                      <td className="py-3 px-4">${(payroll.gross / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4">${(payroll.net / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">${(payroll.bankTransfer / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4 font-semibold text-amber-600">${(payroll.returns / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500">
                          {payroll.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{payroll.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pending Returns Alert */}
          {mockPendingReturns.length > 0 && (
            <Card className="p-6 border-amber-500/50 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Pending Return Alerts</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {mockPendingReturns.length} employees have pending returns. {mockStats.overdueReturns} are overdue.
                  </p>
                  <div className="space-y-2">
                    {mockPendingReturns.slice(0, 3).map((ret) => (
                      <div key={ret.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                        <div>
                          <p className="font-medium text-sm">{ret.employee}</p>
                          <p className="text-xs text-muted-foreground">{ret.employeeId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${ret.amount}</p>
                          <p className={`text-xs ${ret.daysLeft < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {ret.daysLeft < 0 ? `${Math.abs(ret.daysLeft)} days overdue` : `${ret.daysLeft} days left`}
                          </p>
                        </div>
                        <Badge variant={ret.status === 'Overdue' ? 'destructive' : 'outline'}>
                          {ret.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('returns')}>
                    View All Returns
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Payroll Breakdown</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gross Salary</span>
                  <span className="font-semibold">$1,420k</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Deductions</span>
                  <span className="font-semibold text-red-600">-$428k</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">Net Salary</span>
                  <span className="font-bold">$992k</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">Bank Transfer</span>
                  <span className="font-bold text-blue-600">$1,240k</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Return Amount</span>
                  <span className="font-semibold text-amber-600">$248k</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-4">Return Status</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Completed</span>
                    <span className="text-sm font-semibold">{mockStats.completedReturns}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '94%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Pending</span>
                    <span className="text-sm font-semibold">{mockStats.pendingReturns}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '6%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Overdue</span>
                    <span className="text-sm font-semibold">{mockStats.overdueReturns}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '1%' }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('generate')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Generate New Payroll
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('payslips')}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Payslips
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('returns')}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Track Returns
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reports')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Generate Payroll Tab */}
        <TabsContent value="generate">
          <GeneratePayrollTab />
        </TabsContent>

        {/* Payslips Tab */}
        <TabsContent value="payslips">
          <PayslipsTab />
        </TabsContent>

        {/* Return Tracking Tab */}
        <TabsContent value="returns">
          <ReturnTrackingTab />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <AlertsTab />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
