import { checkAdminToken } from '@/auth/admin-guard';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tokenValid = checkAdminToken(sp.token ?? null);

  if (!tokenValid) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <div className="mystic-card rounded-xl p-8">
          <h1
            className="mb-2 text-2xl font-bold text-gradient"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            ✦ 🔒 Admin
          </h1>
          <p className="mb-4 text-sm text-purple-200/70">
            需要在 URL 中附带 <code className="rounded bg-black/40 px-1 text-amber-300">?token=&lt;ADMIN_TOKEN&gt;</code>
          </p>
          <form>
            <input
              type="password"
              name="token"
              placeholder="Admin Token"
              className="mb-3 w-full rounded-lg border border-purple-500/30 bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber-500/50 focus:outline-none"
            />
            <button
              type="submit"
              className="btn-mystic w-full rounded-full py-2.5 text-white"
            >
              进入
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

async function AdminDashboard() {
  const { listRecentJobs } = await import('@/db/queries/divination');
  const jobs = await listRecentJobs(20);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1
        className="mb-8 text-3xl font-bold text-gradient"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        ✦ 📊 Admin Dashboard
      </h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gold">Recent AI Jobs</h2>
        <div className="mystic-card overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead className="border-b border-purple-500/20 bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-purple-200/80">Type</th>
                <th className="px-4 py-3 text-left text-purple-200/80">Model</th>
                <th className="px-4 py-3 text-left text-purple-200/80">Tokens (in/out)</th>
                <th className="px-4 py-3 text-left text-purple-200/80">Duration</th>
                <th className="px-4 py-3 text-left text-purple-200/80">Status</th>
                <th className="px-4 py-3 text-left text-purple-200/80">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-purple-300/60">
                    No jobs yet
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-purple-500/10 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-amber-200/80">{job.type}</td>
                  <td className="px-4 py-3 text-purple-100/80">{job.model}</td>
                  <td className="px-4 py-3 text-xs text-purple-200/60">
                    {job.inputTokens} / {job.outputTokens}
                  </td>
                  <td className="px-4 py-3 text-xs text-purple-200/60">{job.durationMs}ms</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        job.status === 'success'
                          ? 'bg-emerald-900/40 text-emerald-300'
                          : 'bg-rose-900/40 text-rose-300'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-purple-200/60">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-purple-300/60">
        数据库查询 + Inngest 触发按钮待后续版本扩展。
      </p>
    </div>
  );
}