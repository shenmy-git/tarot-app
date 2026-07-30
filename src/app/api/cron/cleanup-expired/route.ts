import { NextResponse, type NextRequest } from 'next/server';
import { inngest } from '@/jobs/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await inngest.send({ name: 'cron/cleanup-expired', data: {} });
  return NextResponse.json({ ok: true });
}