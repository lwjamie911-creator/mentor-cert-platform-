import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  const protectedPaths = ['/dashboard', '/admin', '/zone', '/newbie', '/mentor']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  // 未登录访问受保护页面
  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 已登录访问登录/注册页
  if (token && (pathname === '/login' || pathname === '/register')) {
    if (token.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.redirect(new URL('/zone', request.url))
  }

  // 非管理员访问 admin
  if (token && token.role !== 'admin' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/zone', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/zone/:path*', '/newbie/:path*', '/mentor/:path*', '/login', '/register'],
}
