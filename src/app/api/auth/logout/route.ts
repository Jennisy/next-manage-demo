// ============================================
// POST /api/auth/logout —— 用户退出
// ============================================
// 清除 token cookie 即可
// ============================================

import { TOKEN_COOKIE } from '../../../lib/auth'
import { success } from '../../../lib/apiResponse'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE)
  return success(null, '退出成功')
}
