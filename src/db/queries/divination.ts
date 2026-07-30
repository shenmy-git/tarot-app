import 'server-only';
import { db } from '@/db';
import {
  divinationSessions,
  paymentIntents,
  aiJobs,
  type DivinationSession,
  type PaymentIntent,
} from '@/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';

/**
 * 占卜 session 的服务端查询。
 */

export async function createSession(
  data: Omit<DivinationSession, 'id' | 'createdAt' | 'paymentStatus' | 'aiBasicResult' | 'aiDeepResult'>,
): Promise<DivinationSession> {
  const [row] = await db.insert(divinationSessions).values(data).returning();
  return row;
}

export async function getSessionById(id: string): Promise<DivinationSession | null> {
  const [row] = await db
    .select()
    .from(divinationSessions)
    .where(eq(divinationSessions.id, id))
    .limit(1);
  return row ?? null;
}

export async function getRecentSessionsByIp(
  ipHash: string,
  sinceHours = 24,
): Promise<DivinationSession[]> {
  const cutoff = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
  return db
    .select()
    .from(divinationSessions)
    .where(
      and(
        eq(divinationSessions.ipHash, ipHash),
        gte(divinationSessions.createdAt, cutoff),
      ),
    )
    .orderBy(desc(divinationSessions.createdAt));
}

export async function attachPaymentIntent(sessionId: string, paymentIntentId: string) {
  await db
    .update(divinationSessions)
    .set({ paymentIntentId, paymentStatus: 'pending' })
    .where(eq(divinationSessions.id, sessionId));
}

export async function markSessionPaid(sessionId: string) {
  await db
    .update(divinationSessions)
    .set({ paymentStatus: 'paid', paidAt: new Date() })
    .where(eq(divinationSessions.id, sessionId));
}

export async function getPaymentIntent(id: string): Promise<PaymentIntent | null> {
  const [row] = await db
    .select()
    .from(paymentIntents)
    .where(eq(paymentIntents.id, id))
    .limit(1);
  return row ?? null;
}

export async function getPaymentIntentByExternal(
  provider: string,
  externalId: string,
): Promise<PaymentIntent | null> {
  const [row] = await db
    .select()
    .from(paymentIntents)
    .where(and(eq(paymentIntents.provider, provider), eq(paymentIntents.externalId, externalId)))
    .limit(1);
  return row ?? null;
}

export async function markPaymentPaid(paymentIntentId: string, rawWebhook: unknown) {
  await db
    .update(paymentIntents)
    .set({ status: 'paid', paidAt: new Date(), rawWebhook: rawWebhook as never })
    .where(eq(paymentIntents.id, paymentIntentId));
}

export async function listRecentJobs(limit = 50) {
  return db.select().from(aiJobs).orderBy(desc(aiJobs.createdAt)).limit(limit);
}