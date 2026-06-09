import { prisma } from '../../../lib/prisma'
import { success, fail } from '../../../lib/apiResponse'

// DELETE /api/tags/:id —— 删除标签（自动解除关联，cascade）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tagId = Number(id)
    if (isNaN(tagId)) return fail('无效的标签ID')

    await prisma.tag.delete({ where: { id: tagId } })
    return success(null, '删除成功')
  } catch (e) {
    return fail('删除标签失败')
  }
}
