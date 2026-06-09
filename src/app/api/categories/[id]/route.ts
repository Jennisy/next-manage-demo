import { prisma } from '../../../lib/prisma'
import { success, fail, serverError } from '../../../lib/apiResponse'

// PATCH /api/categories/:id —— 修改分类
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = Number(id)
    if (isNaN(categoryId)) return fail('无效的分类ID')

    const body = await request.json()
    if (!body.name && !body.description) {
      return fail('至少提供一个要修改的字段')
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
      },
    })

    return success(category, '修改成功')
  } catch (e) {
    return fail('修改分类失败')
  }
}

// DELETE /api/categories/:id —— 删除分类（有文章时禁止删除）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = Number(id)
    if (isNaN(categoryId)) return fail('无效的分类ID')

    // 检查是否有文章引用该分类
    const postCount = await prisma.post.count({ where: { categoryId } })
    if (postCount > 0) {
      return fail(`该分类下有 ${postCount} 篇文章，无法删除`)
    }

    await prisma.category.delete({ where: { id: categoryId } })
    return success(null, '删除成功')
  } catch (e) {
    return fail('删除分类失败')
  }
}
