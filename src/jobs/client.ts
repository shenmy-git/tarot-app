import 'server-only';
import { Inngest, EventSchemas } from 'inngest';

type Events = {
  'divination/created': {
    data: {
      sessionId: string;
      module: string;
      locale: string;
      userInputs: Record<string, unknown>;
    };
  };
  'payment/paid': {
    data: {
      paymentIntentId: string;
      sessionId: string;
    };
  };
  'cron/sync-wikipedia': { data: Record<string, never> };
  'cron/generate-daily-content': { data: Record<string, never> };
  'cron/cleanup-expired': { data: Record<string, never> };
};

export const inngest = new Inngest({
  id: 'tarot-app',
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: process.env.INNGEST_DEV === 'true' || !process.env.INNGEST_EVENT_KEY,
});