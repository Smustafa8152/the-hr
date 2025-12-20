import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '../components/common/UIComponents';
import { attendance } from '../data/mockData';

export default function AttendancePage() {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'destructive';
      case 'Early Departure': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">{t('attendance.title')}</h1>
          <p className="text-muted-foreground mt-1">System-controlled punch logs and regularization.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CalendarIcon size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
            Dec 2025
          </Button>
          <Button variant="primary">
            {t('attendance.regularization')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-emerald-500">42</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/20 text-amber-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-2xl font-bold text-amber-500">5</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-destructive/20 text-destructive">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-destructive">3</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On Leave</p>
              <p className="text-2xl font-bold text-blue-500">2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Punch Log Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('attendance.punchLog')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
              Filter
            </Button>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg rtl:rounded-r-lg rtl:rounded-l-none">Employee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Check In</th>
                  <th className="px-4 py-3">Check Out</th>
                  <th className="px-4 py-3">Late (min)</th>
                  <th className="px-4 py-3">Overtime (min)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium">{record.employeeId}</td>
                    <td className="px-4 py-3">{record.date}</td>
                    <td className="px-4 py-3 font-mono text-primary">{record.checkIn}</td>
                    <td className="px-4 py-3 font-mono text-primary">{record.checkOut}</td>
                    <td className="px-4 py-3 text-destructive font-bold">{record.late > 0 ? record.late : '-'}</td>
                    <td className="px-4 py-3 text-emerald-500 font-bold">{record.overtime > 0 ? record.overtime : '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(record.status) as any}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
