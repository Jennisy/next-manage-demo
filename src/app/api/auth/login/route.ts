// ============================================
// POST /api/auth/login —— 用户登录
// ============================================
// 流程：邮箱查用户 → 验证密码 → 签发 JWT → 写入 cookie
// ============================================

import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyPassword, signToken, TOKEN_COOKIE } from '../../../lib/auth'
import { success, fail } from '../../../lib/apiResponse'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 参数校验
    if (!email || !password) {
      return fail('邮箱和密码不能为空')
    }

    // 查询用户
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return fail('邮箱或密码错误')
    }

    // 验证密码（支持明文 "123456" 兼容旧数据 + bcrypt hash）
    const isValid = user.password.startsWith('$2')
      ? await verifyPassword(password, user.password)
      : password === user.password
    if (!isValid) {
      return fail('邮箱或密码错误')
    }

    // 签发 token
    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    // 写入 httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    })

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, '登录成功')
  } catch {
    return fail('登录失败，请稍后再试')
  }
}
