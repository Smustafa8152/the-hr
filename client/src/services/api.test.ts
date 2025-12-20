import { describe, it, expect } from 'vitest';
import { api } from './api';

describe('Supabase API Connection', () => {
  it('should connect to Supabase and fetch data', async () => {
    try {
      // Try to fetch something simple, like checking if the employees table exists
      // We use a limit of 1 to minimize data transfer
      const response = await api.get('/employees?select=count&limit=1');
      
      // If the request is successful, status should be 200-299
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
    } catch (error: any) {
      // If the table doesn't exist, we might get a 404 or 400, but connection worked
      // If auth fails, we get 401/403
      if (error.response) {
        console.log('API Error Status:', error.response.status);
        // 401/403 means keys are wrong
        expect(error.response.status).not.toBe(401);
        expect(error.response.status).not.toBe(403);
      } else {
        throw error;
      }
    }
  });
});
