import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '';

/**
 * 主中间件：
 * 1. /admin/* 受 ADMIN_TOKEN 保护
 * 2. 其他路由 → next-intl locale 路由
 */
export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Admin 路由保护
  if (pathname.startsWith('/admin')) {
    if (!ADMIN_TOKEN) {
      return new NextResponse('Admin disabled (ADMIN_TOKEN not set)', { status: 503 });
    }
    // 校验：URL ?token= 或 cookie 'admin-token' 或 header 'x-admin-token'
    const urlToken = searchParams.get('token');
    const cookieToken = request.cookies.get('admin-token')?.value;
    const headerToken = request.headers.get('x-admin-token');
    const provided = urlToken || cookieToken || headerToken;
    if (provided !== ADMIN_TOKEN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // 通过：保留 admin 路径，不交给 intlMiddleware
    return NextResponse.next();
  }

  // 其他路由走 intl
  return intlMiddleware(request);
}

export const config = {
  // 排除：API、_next、静态资源、admin
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};