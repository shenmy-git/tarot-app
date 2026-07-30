import { inngest } from '../client';

/**
 * 同步 Wikipedia 词条 → entries 表。
 * 由 Vercel Cron 每天 02:00 触发。
 *
 * 实现步骤：
 * 1. 拉预设关键词列表（tarot, astrology, bazi, i_ching, dream_interpretation）
 * 2. 调 Wikipedia API 获取对应词条（en + zh）
 * 3. 翻译 / 写入 entries 表
 * 4. 触发器自动更新 search_tsv
 */
export const syncWikipedia = inngest.createFunction(
  { id: 'sync-wikipedia', name: 'Sync Wikipedia Entries' },
  [{ cron: '0 2 * * *' }, { event: 'cron/sync-wikipedia' }],
  async ({ step }) => {
    const topics = [
      'Tarot',
      'Major Arcana',
      'Astrology',
      'Zodiac',
      'Ba Zi',
      'I Ching',
      'Dream interpretation',
      'Western astrology',
    ];

    const results = await Promise.all(
      topics.map((topic) =>
        step.run(`fetch-${topic}`, async () => {
          const res = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
              topic,
            )}&format=json`,
          );
          if (!res.ok) return null;
          const data = await res.json();
          const pages = (data.query?.pages ?? {}) as Record<
            string,
            { title: string; extract?: string; pageid: number }
          >;
          const page = Object.values(pages)[0];
          return page ? { slug: topic, title: page.title, summary: page.extract ?? '' } : null;
        }),
      ),
    );

    return { synced: results.filter(Boolean).length, topics: topics.length };
  },
);