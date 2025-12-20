import { api, adminApi } from './api';

export interface TimesheetEntry {
  id: string;
  employee_id: string;
  week: string;
  project: string;
  hours: { [key: string]: number }; // { Mon: 8, Tue: 4 ... }
  status: 'Draft' | 'Submitted' | 'Approved';
  total_hours: number;
}

export const timesheetService = {
  async getMyTimesheets(employeeId: string, week: string) {
    try {
      const response = await api.get(`/timesheets?employee_id=eq.${employeeId}&week=eq.${week}&select=*`);
      return response.data as TimesheetEntry[];
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      console.error('Error fetching timesheets:', error);
      return [];
    }
  },

  async saveTimesheet(entry: Omit<TimesheetEntry, 'id' | 'status' | 'total_hours'>) {
    try {
      const total_hours = Object.values(entry.hours).reduce((a, b) => a + b, 0);
      const payload = {
        ...entry,
        status: 'Draft',
        total_hours
      };
      
      const response = await adminApi.post('/timesheets', payload);
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return response.data;
    } catch (error) {
      console.error('Error saving timesheet:', error);
      throw error;
    }
  }
};
