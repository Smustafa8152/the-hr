import { leaveService } from './leaveService';
import { attendanceService } from './attendanceService';

export const essService = {
  async getDashboardStats(employeeId: string) {
    try {
      const [attendance, leaves] = await Promise.all([
        attendanceService.getByEmployee(employeeId),
        leaveService.getByEmployee(employeeId)
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayLog = attendance.find(a => a.date === today);
      const pendingRequests = leaves.filter(l => l.status === 'Pending').length;

      return {
        checkInTime: todayLog?.check_in ? new Date(todayLog.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
        leaveBalance: 0, // Needs backend support for real balance
        nextPayday: 'TBD',
        pendingRequests
      };
    } catch (error) {
      console.error('Error fetching ESS stats:', error);
      return {
        checkInTime: '--:--',
        leaveBalance: 0,
        nextPayday: '-',
        pendingRequests: 0
      };
    }
  },

  async getMyRequests(employeeId: string) {
    return leaveService.getByEmployee(employeeId);
  },

  async getPayslips(employeeId: string) {
    // Return empty array until payroll history is implemented
    return [];
  }
};
