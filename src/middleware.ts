// ============================================
// middleware.ts —— 路由权限守卫
// ============================================
// 保护需要登录的页面，未登录重定向到 /login
// 用户列表只有管理员能访问
// ============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { TOKEN_COOKIE, verifyToken } from './app/lib/auth'

// 需要登录才能访问的路径
const protectedPaths = ['/users', '/about', '/posts', '/categories', '/tags']

// 需要管理员角色的路径
const adminPaths = ['/users']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 登录页不拦截
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // 检查是否需要保护
  const needsAuth = protectedPaths.some((p) => pathname.startsWith(p))
  if (!needsAuth) {
    return NextResponse.next()
  }

  // 从 cookie 获取 token
  const token = request.cookies.get(TOKEN_COOKIE)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 验证 token
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 检查管理员权限
  const needsAdmin = adminPaths.some((p) => pathname.startsWith(p))
  if (needsAdmin && payload.role !== '管理员') {
    return NextResponse.redirect(new URL('/?error=forbidden', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // 只对页面路由生效，不拦截 API、静态资源
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

// 使用 Node.js runtime（jsonwebtoken 依赖 Node 的 crypto 模块，无法在 Edge Runtime 运行）
export const runtime = 'nodejs'
