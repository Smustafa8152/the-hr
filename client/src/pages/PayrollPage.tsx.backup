import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  Download, 
  CheckCircle, 
  Lock, 
  AlertTriangle,
  FileText,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '../components/common/UIComponents';
import Modal from '../components/common/Modal';
import { payrollService, PayrollCycle } from '../services/payrollService';

export default function PayrollPage() {
  const { t } = useTranslation();
  const [cycles, setCycles] = useState<PayrollCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await payrollService.getAll();
      setCycles(data);
    } catch (error) {
      console.error('Failed to load payroll cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payrollService.createCycle(newPeriod);
      await loadData();
      setIsModalOpen(false);
      setNewPeriod('');
    } catch (error) {
      console.error('Failed to run payroll:', error);
      alert('Failed to run payroll');
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await payrollService.updateStatus(id, 'Processed');
      await loadData();
    } catch (error) {
      console.error('Failed to process payroll:', error);
      alert('Failed to process payroll');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">{t('payroll.title')}</h1>
          <p className="text-muted-foreground mt-1">Manage salaries, approvals, and processing.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <DollarSign size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
          Run Payroll
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Run New Payroll">
        <form onSubmit={handleRunPayroll} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Period</label>
            <Input 
              type="month" 
              value={newPeriod}
              onChange={e => setNewPeriod(e.target.value)}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit">Start Processing</Button>
          </div>
        </form>
      </Modal>

      {/* Payroll Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading payroll data...</div>
        ) : cycles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No payroll cycles found.</div>
        ) : cycles.map((cycle) => (
          <Card key={cycle.id} className="group hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{cycle.period}</CardTitle>
              <Badge variant={cycle.status === 'Processed' ? 'success' : 'warning'}>
                {cycle.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Employees</span>
                  <span className="font-bold font-mono">{cycle.total_employees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold font-mono text-lg text-primary">${cycle.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Approval Date</span>
                  <span className="text-sm">{cycle.approval_date || '-'}</span>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex gap-2">
                  {cycle.status === 'Processed' ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                        Slips
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                        Report
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleProcess(cycle.id)}
                    >
                      Finalize & Approve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payroll Alerts */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 rounded-full bg-amber-500/20 text-amber-500 shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-500">Payroll Cutoff Warning</h3>
            <p className="text-muted-foreground mt-1">
              The payroll cutoff for the current month is approaching. 
              All attendance regularizations and leave requests must be approved before the 25th. 
              The system will automatically lock all inputs at 23:59 on the cutoff date.
            </p>
            <Button variant="outline" className="mt-4 border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
              View Pending Approvals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
