import { describe, it } from 'vitest';
import { inspectTimesheets } from './inspectTimesheets';

describe('Inspect Timesheets Table', () => {
  it('should check if timesheets table exists', async () => {
    await inspectTimesheets();
  });
});
