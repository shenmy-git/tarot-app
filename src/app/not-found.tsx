export default function NotFound() {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-6xl font-bold">404</h1>
            <p className="text-muted-foreground">页面未找到</p>
            <a href="/zh-CN" className="mt-4 inline-block text-primary underline">
              返回首页
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}