import { Download, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReportsTab() {
  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Generate Reports</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select defaultValue="monthly">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Payroll Summary</SelectItem>
                <SelectItem value="returns">Return Tracking Report</SelectItem>
                <SelectItem value="compliance">Compliance Adjustment Report</SelectItem>
                <SelectItem value="department">Department-wise Payroll</SelectItem>
                <SelectItem value="annual">Annual Payroll Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Period</label>
            <Select defaultValue="december">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="december">December 2024</SelectItem>
                <SelectItem value="november">November 2024</SelectItem>
                <SelectItem value="october">October 2024</SelectItem>
                <SelectItem value="q4">Q4 2024</SelectItem>
                <SelectItem value="2024">Full Year 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select defaultValue="pdf">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Payroll Trends</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">December 2024</span>
              <span className="font-semibold">$1,420k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">November 2024</span>
              <span className="font-semibold">$1,380k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">October 2024</span>
              <span className="font-semibold">$1,350k</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+5.2% growth</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Return Compliance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Returns</span>
              <span className="font-semibold">248</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <span className="font-semibold text-green-600">233 (94%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending</span>
              <span className="font-semibold text-amber-600">15 (6%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Overdue</span>
              <span className="font-semibold text-red-600">3 (1%)</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Financial Summary</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gross Payroll</span>
              <span className="font-semibold">$1,420k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Deductions</span>
              <span className="font-semibold text-red-600">-$428k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Net Payroll</span>
              <span className="font-semibold">$992k</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm">Bank Transfers</span>
              <span className="font-semibold text-blue-600">$1,240k</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Available Reports</h4>
        <div className="space-y-3">
          {[
            { name: 'Monthly Payroll Summary - December 2024', date: '2024-12-25', size: '2.4 MB' },
            { name: 'Return Tracking Report - December 2024', date: '2024-12-26', size: '1.8 MB' },
            { name: 'Compliance Adjustment Report - December 2024', date: '2024-12-26', size: '1.2 MB' },
            { name: 'Department-wise Payroll - December 2024', date: '2024-12-25', size: '1.5 MB' },
            { name: 'Annual Payroll Report - 2024', date: '2024-12-31', size: '5.6 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{report.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Generated on {report.date} • {report.size}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
