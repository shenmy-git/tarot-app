import { inngest } from '../client';
import { db } from '@/db';
import { divinationSessions } from '@/db/schema';
import { and, eq, lt } from 'drizzle-orm';

/**
 * 清理过期未支付的 session（30 天前的 free/pending）。
 * 每周日凌晨 3 点跑一次。
 */
export const cleanupExpired = inngest.createFunction(
  { id: 'cleanup-expired', name: 'Cleanup Expired Sessions' },
  [{ cron: '0 3 * * 0' }, { event: 'cron/cleanup-expired' }],
  async ({ step }) => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deleted = await step.run('delete-old-sessions', async () => {
      const result = await db
        .delete(divinationSessions)
        .where(
          and(
            lt(divinationSessions.createdAt, cutoff),
            eq(divinationSessions.paymentStatus, 'free'),
          ),
        )
        .returning({ id: divinationSessions.id });
      return result.length;
    });

    return { deleted };
  },
);