import { api } from './api';

export async function inspectTimesheets() {
  try {
    // Try to fetch one record to see if table exists
    const response = await api.get('/timesheets?limit=1');
    console.log('Timesheets table exists:', response.status);
    return true;
  } catch (error: any) {
    console.error('Error inspecting timesheets:', error.response?.status, error.response?.data);
    return false;
  }
}
