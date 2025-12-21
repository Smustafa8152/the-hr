// Using Supabase REST API for dynamic data

import { api, adminApi } from './api';

// Supabase table structure
interface SupabaseEmployee {
  id: string; // UUID
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  join_date?: string;
  status?: string;
  employment_type?: string;
  avatar_url?: string;
  manager_id?: string;
  created_at?: string;
}

export interface Employee {
  id: string; // UUID from Supabase
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  salary?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  employmentType: 'Full Time' | 'Part Time' | 'Consultant';
  createdAt?: string;
  updatedAt?: string;
  
  // Legacy field names for compatibility
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  designation?: string;
  join_date?: string;
  employment_type?: 'Full Time' | 'Part Time' | 'Consultant';
  avatar_url?: string;
}

// Helper function to map Supabase employee to Employee interface
function mapSupabaseToEmployee(supabaseEmp: SupabaseEmployee): Employee {
  return {
    id: supabaseEmp.id,
    employeeId: supabaseEmp.employee_id,
    firstName: supabaseEmp.first_name,
    lastName: supabaseEmp.last_name,
    email: supabaseEmp.email,
    phone: supabaseEmp.phone,
    department: supabaseEmp.department,
    position: supabaseEmp.designation,
    hireDate: supabaseEmp.join_date,
    status: (supabaseEmp.status as 'Active' | 'Inactive' | 'On Leave') || 'Active',
    employmentType: (supabaseEmp.employment_type as 'Full Time' | 'Part Time' | 'Consultant') || 'Full Time',
    createdAt: supabaseEmp.created_at,
    // Legacy fields
    employee_id: supabaseEmp.employee_id,
    first_name: supabaseEmp.first_name,
    last_name: supabaseEmp.last_name,
    designation: supabaseEmp.designation,
    join_date: supabaseEmp.join_date,
    employment_type: supabaseEmp.employment_type as 'Full Time' | 'Part Time' | 'Consultant',
    avatar_url: supabaseEmp.avatar_url
  };
}

// Helper function to map Employee to Supabase format
function mapEmployeeToSupabase(employee: any): Partial<SupabaseEmployee & { company_id?: string }> {
  const mapped: any = {
    employee_id: employee.employee_id || employee.employeeId,
    first_name: employee.first_name || employee.firstName,
    last_name: employee.last_name || employee.lastName,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    designation: employee.designation || employee.position,
    join_date: employee.join_date || employee.hireDate,
    status: employee.status || 'Active',
    employment_type: employee.employment_type || employee.employmentType || 'Full Time',
    avatar_url: employee.avatar_url
  };
  
  // Include additional fields that might be in the employee object
  if (employee.company_id !== undefined) mapped.company_id = employee.company_id;
  if (employee.department_id !== undefined) mapped.department_id = employee.department_id;
  if (employee.role_id !== undefined) mapped.role_id = employee.role_id;
  if (employee.job_id !== undefined) mapped.job_id = employee.job_id;
  if (employee.salary !== undefined) mapped.salary = employee.salary;
  if (employee.work_location !== undefined) mapped.work_location = employee.work_location;
  if (employee.reporting_manager_id !== undefined) mapped.reporting_manager_id = employee.reporting_manager_id;
  if (employee.notes !== undefined) mapped.notes = employee.notes;
  if (employee.phone !== undefined) mapped.phone = employee.phone;
  if (employee.alternate_phone !== undefined) mapped.alternate_phone = employee.alternate_phone;
  if (employee.date_of_birth !== undefined) mapped.date_of_birth = employee.date_of_birth;
  if (employee.gender !== undefined) mapped.gender = employee.gender;
  if (employee.marital_status !== undefined) mapped.marital_status = employee.marital_status;
  if (employee.nationality !== undefined) mapped.nationality = employee.nationality;
  if (employee.address !== undefined) mapped.address = employee.address;
  if (employee.city !== undefined) mapped.city = employee.city;
  if (employee.state !== undefined) mapped.state = employee.state;
  if (employee.country !== undefined) mapped.country = employee.country;
  if (employee.postal_code !== undefined) mapped.postal_code = employee.postal_code;
  if (employee.emergency_contact_name !== undefined) mapped.emergency_contact_name = employee.emergency_contact_name;
  if (employee.emergency_contact_phone !== undefined) mapped.emergency_contact_phone = employee.emergency_contact_phone;
  if (employee.emergency_contact_relationship !== undefined) mapped.emergency_contact_relationship = employee.emergency_contact_relationship;
  
  return mapped;
}

export const employeeService = {
  async getAll(companyId?: string): Promise<Employee[]> {
    try {
      const params: any = {
        select: '*',
        order: 'created_at.desc'
      };
      
      // Filter by company_id if provided (for admin users)
      if (companyId) {
        params.company_id = `eq.${companyId}`;
      }
      
      const response = await api.get<SupabaseEmployee[]>('/employees', { params });
      
      return response.data.map(mapSupabaseToEmployee);
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },

  async getById(id: string | number): Promise<Employee | null> {
    try {
      const uuid = typeof id === 'number' ? id.toString() : id;
      const response = await api.get<SupabaseEmployee[]>(`/employees`, {
        params: {
          id: `eq.${uuid}`,
          select: '*'
        }
      });
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        return mapSupabaseToEmployee(response.data[0]);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      return null;
    }
  },

  async create(employee: any): Promise<Employee> {
    try {
      const supabaseData = mapEmployeeToSupabase(employee);
      
      const response = await adminApi.post<SupabaseEmployee[]>('/employees', supabaseData);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        return mapSupabaseToEmployee(response.data[0]);
      }
      
      throw new Error('Failed to create employee');
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  async update(id: string | number, updates: any): Promise<{ success: boolean }> {
    try {
      const uuid = typeof id === 'number' ? id.toString() : id;
      const supabaseData = mapEmployeeToSupabase(updates);
      
      await adminApi.patch(`/employees`, supabaseData, {
        params: {
          id: `eq.${uuid}`
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  async delete(id: string | number): Promise<boolean> {
    try {
      const uuid = typeof id === 'number' ? id.toString() : id;
      
      await adminApi.delete(`/employees`, {
        params: {
          id: `eq.${uuid}`
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
};
