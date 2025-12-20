import { supabase } from './supabase';

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
      
    if (error) throw error;
    return data as AttendanceLog[];
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
