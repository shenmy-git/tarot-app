export default function NotFound() {
  return (
    <html>
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mystic-card rounded-xl p-12 text-center">
            <div className="mb-4 text-6xl">✦</div>
            <h1
              className="mb-2 text-6xl font-bold text-gradient"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              404
            </h1>
            <p className="mb-4 text-purple-200/70">页面未找到</p>
            <a href="/zh-CN" className="text-gold underline hover:text-amber-300">
              返回首页
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}