import { serve } from 'inngest/next';
import { inngest } from '@/jobs/client';
import { syncWikipedia } from '@/jobs/functions/sync-wikipedia';
import { generateBasicReading } from '@/jobs/functions/generate-basic';
import { generateDeepReport } from '@/jobs/functions/generate-deep';
import { cleanupExpired } from '@/jobs/functions/cleanup-expired';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncWikipedia, generateBasicReading, generateDeepReport, cleanupExpired],
});