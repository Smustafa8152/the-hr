import { describe, it } from 'vitest';
import { inspectDocuments } from './inspectDocuments';

describe('Inspect Documents Table', () => {
  it('should check if documents table exists', async () => {
    await inspectDocuments();
  });
});
