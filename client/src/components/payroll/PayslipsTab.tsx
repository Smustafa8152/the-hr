import { useState } from 'react';
import { Search, Download, Eye, Printer, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Mock payslip data
const mockPayslips = [
  {
    id: 1,
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'Engineering',
    period: 'December 2024',
    payDate: '2024-12-25',
    basicSalary: 4500,
    housingAllowance: 1000,
    transportAllowance: 500,
    grossSalary: 6000,
    taxDeduction: 600,
    socialInsurance: 300,
    totalDeductions: 900,
    netSalary: 5100,
    governmentRegisteredAmount: 7000,
    returnAmount: 1900,
    bankTransferAmount: 7000,
    finalNetPayroll: 5100,
    bankTransferReference: 'TRF-2024-12-001',
    returnStatus: 'Pending',
  },
  {
    id: 2,
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    department: 'Sales',
    period: 'December 2024',
    payDate: '2024-12-25',
    basicSalary: 3800,
    housingAllowance: 800,
    transportAllowance: 400,
    grossSalary: 5000,
    taxDeduction: 500,
    socialInsurance: 250,
    totalDeductions: 750,
    netSalary: 4250,
    governmentRegisteredAmount: 6000,
    returnAmount: 1750,
    bankTransferAmount: 6000,
    finalNetPayroll: 4250,
    bankTransferReference: 'TRF-2024-12-002',
    returnStatus: 'Completed',
  },
];

export default function PayslipsTab() {
  const [payslips, setPayslips] = useState(mockPayslips);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Filter payslips
  const filteredPayslips = payslips.filter((payslip) => {
    const matchesSearch =
      payslip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payslip.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPeriod = periodFilter === 'all' || payslip.period === periodFilter;
    const matchesDepartment = departmentFilter === 'all' || payslip.department === departmentFilter;
    return matchesSearch && matchesPeriod && matchesDepartment;
  });

  const handleViewPayslip = (payslip: any) => {
    setSelectedPayslip(payslip);
    setViewModalOpen(true);
  };

  const handleDownloadPayslip = (payslip: any) => {
    alert(`Downloading payslip for ${payslip.employeeName}...`);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="December 2024">December 2024</SelectItem>
              <SelectItem value="November 2024">November 2024</SelectItem>
              <SelectItem value="October 2024">October 2024</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </Card>

      {/* Payslips List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Net Salary</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Bank Transfer</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Return Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Return Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayslips.map((payslip) => (
                <tr key={payslip.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{payslip.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{payslip.employeeId}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{payslip.period}</td>
                  <td className="py-3 px-4 text-sm">{payslip.department}</td>
                  <td className="py-3 px-4 text-right font-semibold">${payslip.netSalary.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-600">${payslip.bankTransferAmount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-600">${payslip.returnAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={payslip.returnStatus === 'Completed' ? 'outline' : 'secondary'} className={payslip.returnStatus === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-500' : 'bg-amber-500/20 text-amber-700 border-amber-500'}>
                      {payslip.returnStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewPayslip(payslip)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPayslip(payslip)}>
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payslip View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip - {selectedPayslip?.period}</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold">NZSuite</h3>
                  <p className="text-sm text-muted-foreground">Enterprise HR Management System</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Pay Date: {selectedPayslip.payDate}</p>
                  <p className="text-xs text-muted-foreground">Reference: {selectedPayslip.bankTransferReference}</p>
                </div>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm text-muted-foreground">Employee Name</p>
                  <p className="font-semibold">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-semibold">{selectedPayslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-semibold">{selectedPayslip.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pay Period</p>
                  <p className="font-semibold">{selectedPayslip.period}</p>
                </div>
              </div>

              {/* Salary Calculation */}
              <div>
                <h4 className="font-semibold mb-3 text-lg">Salary Calculation</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Basic Salary</span>
                    <span className="font-medium">${selectedPayslip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Housing Allowance</span>
                    <span className="font-medium">${selectedPayslip.housingAllowance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Transport Allowance</span>
                    <span className="font-medium">${selectedPayslip.transportAllowance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="font-medium">Gross Salary</span>
                    <span className="font-bold">${selectedPayslip.grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="font-semibold mb-3 text-lg">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Tax Deduction</span>
                    <span className="font-medium text-red-600">-${selectedPayslip.taxDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Social Insurance</span>
                    <span className="font-medium text-red-600">-${selectedPayslip.socialInsurance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="font-medium">Total Deductions</span>
                    <span className="font-bold text-red-600">-${selectedPayslip.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">NET SALARY</span>
                  <span className="text-2xl font-bold text-green-600">${selectedPayslip.netSalary.toLocaleString()}</span>
                </div>
              </div>

              {/* Government Compliance Adjustment */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Government Registered Amount</span>
                    <span className="font-semibold text-blue-600">${selectedPayslip.governmentRegisteredAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    (Amount transferred to your bank account)
                  </p>
                </div>
              </div>

              {/* Return Amount */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-semibold mb-3">Amount to Return</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance Adjustment</span>
                    <span className="font-semibold text-amber-600">${selectedPayslip.returnAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    (To be returned to company within the month via bank transfer)
                  </p>
                  <div className="mt-2">
                    <Badge variant={selectedPayslip.returnStatus === 'Completed' ? 'outline' : 'secondary'} className={selectedPayslip.returnStatus === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-500' : 'bg-amber-500/20 text-amber-700 border-amber-500'}>
                      Return Status: {selectedPayslip.returnStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Final Summary */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">FINAL NET PAYROLL</span>
                  <span className="text-2xl font-bold">${selectedPayslip.finalNetPayroll.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  (Your actual take-home amount after return)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
