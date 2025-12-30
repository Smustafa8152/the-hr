import { useState } from 'react';
import { Search, CheckCircle, AlertCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Mock return data
const mockReturns = [
  {
    id: 1,
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'Engineering',
    period: 'December 2024',
    returnAmount: 1900,
    dueDate: '2024-12-31',
    status: 'Pending',
    daysLeft: 2,
    bankTransferAmount: 7000,
    netSalary: 5100,
  },
  {
    id: 2,
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    department: 'Sales',
    period: 'December 2024',
    returnAmount: 1750,
    dueDate: '2024-12-31',
    status: 'Completed',
    returnedAmount: 1750,
    returnDate: '2024-12-26',
    returnReference: 'RET-2024-12-002',
    bankTransferAmount: 6000,
    netSalary: 4250,
  },
  {
    id: 3,
    employeeId: 'EMP003',
    employeeName: 'Mike Johnson',
    department: 'Marketing',
    period: 'December 2024',
    returnAmount: 1953,
    dueDate: '2024-12-28',
    status: 'Overdue',
    daysLeft: -1,
    bankTransferAmount: 6500,
    netSalary: 4547,
  },
];

export default function ReturnTrackingTab() {
  const [returns, setReturns] = useState(mockReturns);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [markReturnedModalOpen, setMarkReturnedModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const [returnReference, setReturnReference] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  // Filter returns
  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      ret.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || ret.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleMarkReturned = (ret: any) => {
    setSelectedReturn(ret);
    setReturnDate(new Date().toISOString().split('T')[0]);
    setReturnReference('');
    setReturnNotes('');
    setMarkReturnedModalOpen(true);
  };

  const handleConfirmReturn = () => {
    if (!returnReference.trim()) {
      toast.error('Please enter a return reference');
      return;
    }

    // Update return status
    setReturns(
      returns.map((ret) =>
        ret.id === selectedReturn.id
          ? {
              ...ret,
              status: 'Completed',
              returnedAmount: ret.returnAmount,
              returnDate,
              returnReference,
              notes: returnNotes,
              daysLeft: undefined,
            }
          : ret
      )
    );

    toast.success(`Return marked as completed for ${selectedReturn.employeeName}`);
    setMarkReturnedModalOpen(false);
  };

  // Calculate statistics
  const totalReturns = returns.length;
  const pendingReturns = returns.filter((r) => r.status === 'Pending').length;
  const completedReturns = returns.filter((r) => r.status === 'Completed').length;
  const overdueReturns = returns.filter((r) => r.status === 'Overdue').length;
  const totalPendingAmount = returns
    .filter((r) => r.status === 'Pending' || r.status === 'Overdue')
    .reduce((sum, r) => sum + r.returnAmount, 0);
  const totalCompletedAmount = returns
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + (r.returnedAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Returns</p>
              <p className="text-2xl font-bold">{totalReturns}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{pendingReturns}</p>
              <p className="text-xs text-muted-foreground mt-1">${(totalPendingAmount / 1000).toFixed(0)}k</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedReturns}</p>
              <p className="text-xs text-muted-foreground mt-1">${(totalCompletedAmount / 1000).toFixed(0)}k</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueReturns}</p>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Returns List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Return Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{ret.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{ret.employeeId}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{ret.period}</td>
                  <td className="py-3 px-4 text-sm">{ret.department}</td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-600">${ret.returnAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{ret.dueDate}</span>
                    </div>
                    {ret.status !== 'Completed' && ret.daysLeft !== undefined && (
                      <p className={`text-xs mt-1 ${ret.daysLeft < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {ret.daysLeft < 0 ? `${Math.abs(ret.daysLeft)} days overdue` : `${ret.daysLeft} days left`}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={ret.status === 'Completed' ? 'outline' : 'secondary'}
                      className={
                        ret.status === 'Completed'
                          ? 'bg-green-500/20 text-green-700 border-green-500'
                          : ret.status === 'Overdue'
                          ? 'bg-red-500/20 text-red-700 border-red-500'
                          : 'bg-amber-500/20 text-amber-700 border-amber-500'
                      }
                    >
                      {ret.status}
                    </Badge>
                    {ret.status === 'Completed' && ret.returnDate && (
                      <p className="text-xs text-muted-foreground mt-1">Returned: {ret.returnDate}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {ret.status !== 'Completed' ? (
                      <Button size="sm" onClick={() => handleMarkReturned(ret)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark Returned
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Ref: {ret.returnReference}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mark Returned Modal */}
      <Dialog open={markReturnedModalOpen} onOpenChange={setMarkReturnedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Return as Completed</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employee</p>
                    <p className="font-semibold">{selectedReturn.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employee ID</p>
                    <p className="font-semibold">{selectedReturn.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Return Amount</p>
                    <p className="font-semibold text-amber-600">${selectedReturn.returnAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-semibold">{selectedReturn.period}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Return Date *</Label>
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>

              <div>
                <Label>Bank Transfer Reference *</Label>
                <Input
                  placeholder="e.g., TRF-2024-12-001"
                  value={returnReference}
                  onChange={(e) => setReturnReference(e.target.value)}
                />
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any additional notes..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkReturnedModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReturn}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
