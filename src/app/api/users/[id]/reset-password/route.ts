// ============================================
// POST /api/users/:id/reset-password —— 重置用户密码
// ============================================
// 流程：将指定用户的密码重置为默认密码 654321（bcrypt hash 后入库）
// ============================================

import { prisma } from '../../../../lib/prisma'
import { success, fail } from '../../../../lib/apiResponse'
import { hashPassword } from '../../../../lib/auth'

// 重置后的默认密码（明文，仅用于提示用户）
const RESET_PASSWORD = '654321'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId: number = Number(id)

    if (isNaN(userId)) {
      return fail('无效的用户ID')
    }

    // 把默认密码 hash 后再入库，确保数据库不出现明文
    const hashedPassword: string = await hashPassword(RESET_PASSWORD)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return success(
      { defaultPassword: RESET_PASSWORD },
      `密码已重置为 ${RESET_PASSWORD}`
    )
  } catch (e) {
    return fail('重置密码失败，用户可能不存在')
  }
}
