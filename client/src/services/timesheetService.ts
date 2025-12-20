import { supabase } from './supabase';

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
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('week', week);
        
      if (error) {
        // Fallback to mock if table doesn't exist yet
        console.warn('Timesheet table missing, using mock');
        return [
          { id: '1', employee_id: employeeId, week, status: 'Draft' as const, project: 'Project Alpha', hours: { Mon: 8, Tue: 8, Wed: 8, Thu: 8, Fri: 8 }, total_hours: 40 },
          { id: '2', employee_id: employeeId, week, status: 'Draft' as const, project: 'Internal Ops', hours: { Mon: 2, Tue: 0, Wed: 1, Thu: 0, Fri: 2 }, total_hours: 5 }
        ];
      }
      return data as TimesheetEntry[];
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      return [];
    }
  },

  async saveTimesheet(entry: Omit<TimesheetEntry, 'id' | 'status' | 'total_hours'>) {
    // Mock save
    console.log('Saving timesheet:', entry);
    return { ...entry, id: Math.random().toString(), status: 'Draft', total_hours: 0 };
  }
};
