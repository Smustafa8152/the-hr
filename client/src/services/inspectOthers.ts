import { api } from './api';

export async function inspectOthers() {
  try {
    const payroll = await api.get('/payroll?limit=1').catch(e => e.response);
    console.log('Payroll table status:', payroll.status);
    
    const candidates = await api.get('/candidates?limit=1').catch(e => e.response);
    console.log('Candidates table status:', candidates.status);
  } catch (error) {
    console.error('Error inspecting others:', error);
  }
}
