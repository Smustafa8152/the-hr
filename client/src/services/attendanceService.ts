import { supabase } from './supabase';
import { attendance as mockAttendance } from '../data/mockData';

export interface AttendanceLog {
  id: string;
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string;
  status: string;
  late_minutes: number;
  overtime_minutes: number;
  is_regularized: boolean;
  employees?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export const attendanceService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          employees (
            first_name,
            last_name,
            employee_id
          )
        `)
        .order('date', { ascending: false });
        
      if (error) {
        console.warn('Supabase error, falling back to mock data:', error.message);
        return this.getMockData();
      }
      return data as AttendanceLog[];
    } catch (err) {
      console.warn('Connection failed, falling back to mock data');
      return this.getMockData();
    }
  },

  getMockData(): AttendanceLog[] {
    return mockAttendance.map(a => ({
      id: String(a.id),
      employee_id: a.employeeId,
      date: a.date,
      check_in: a.checkIn ? `${a.date}T${a.checkIn}` : '',
      check_out: a.checkOut ? `${a.date}T${a.checkOut}` : '',
      status: a.status,
      late_minutes: a.late,
      overtime_minutes: a.overtime,
      is_regularized: false,
      employees: {
        first_name: a.employeeId,
        last_name: '',
        employee_id: a.employeeId
      }
    }));
  },

  async getByEmployee(employeeId: string) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data as AttendanceLog[];
  },

  async createPunch(log: Partial<AttendanceLog>) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert([log])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
