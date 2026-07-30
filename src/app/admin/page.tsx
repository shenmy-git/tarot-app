import { checkAdminToken } from '@/auth/admin-guard';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tokenValid = checkAdminToken(sp.token ?? null);

  if (!tokenValid) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="rounded-lg border bg-card p-6">
          <h1 className="mb-2 text-xl font-bold">🔒 Admin</h1>
          <p className="mb-4 text-sm text-muted-foreground">需要在 URL 中附带 ?token=&lt;ADMIN_TOKEN&gt;</p>
          <form>
            <input
              type="password"
              name="token"
              placeholder="Admin Token"
              className="mb-2 w-full rounded-md border px-3 py-2"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">📊 Admin Dashboard</h1>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Recent AI Jobs</h2>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Model</th>
                <th className="px-4 py-2 text-left">Tokens (in/out)</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No jobs yet
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{job.type}</td>
                  <td className="px-4 py-2">{job.model}</td>
                  <td className="px-4 py-2 text-xs">
                    {job.inputTokens} / {job.outputTokens}
                  </td>
                  <td className="px-4 py-2 text-xs">{job.durationMs}ms</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        job.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        数据库查询 + Inngest 触发按钮待后续版本扩展。
      </p>
    </div>
  );
}