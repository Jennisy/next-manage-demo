import { prisma } from '../../../lib/prisma'
import { success, fail, serverError } from '../../../lib/apiResponse'

// GET /api/users/:id —— 获取单个用户详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = Number(id)

    if (isNaN(userId)) {
      return fail('无效的用户ID')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return fail('用户不存在')
    }

    return success(user)
  } catch (e) {
    return serverError('获取用户详情失败')
  }
}

// PATCH /api/users/:id —— 修改用户信息
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = Number(id)

    if (isNaN(userId)) {
      return fail('无效的用户ID')
    }

    const body = await request.json()
    const { name, email, role, status } = body

    if (!name && !email && !role && !status) {
      return fail('至少提供一个要修改的字段')
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
      },
    })

    return success(user, '修改成功')
  } catch (e) {
    return fail('修改用户失败，用户可能不存在')
  }
}

// DELETE /api/users/:id —— 删除用户
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = Number(id)

    if (isNaN(userId)) {
      return fail('无效的用户ID')
    }

    await prisma.user.delete({ where: { id: userId } })

    return success(null, '删除成功')
  } catch (e) {
    return fail('删除失败，用户可能不存在')
  }
}
