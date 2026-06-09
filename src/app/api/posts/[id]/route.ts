import { prisma } from '../../../lib/prisma'
import { success, fail, serverError } from '../../../lib/apiResponse'

// GET /api/posts/:id —— 文章详情（含作者、分类、标签）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = Number(id)
    if (isNaN(postId)) return fail('无效的文章ID')

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    })

    if (!post) return fail('文章不存在')
    return success(post)
  } catch (e) {
    return serverError('获取文章详情失败')
  }
}

// PATCH /api/posts/:id —— 修改文章
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = Number(id)
    if (isNaN(postId)) return fail('无效的文章ID')

    const body = await request.json()
    const { title, content, summary, status, categoryId, tagIds } = body

    // 用事务处理标签更新（先删再建）
    const post = await prisma.$transaction(async (tx) => {
      // 如果传了 tagIds，先删旧关联再建新关联
      if (tagIds !== undefined) {
        await tx.postTag.deleteMany({ where: { postId } })
        if (tagIds.length > 0) {
          await tx.postTag.createMany({
            data: tagIds.map((tagId: number) => ({ postId, tagId })),
          })
        }
      }

      return tx.post.update({
        where: { id: postId },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(summary !== undefined && { summary }),
          ...(status && { status }),
          ...(categoryId && { categoryId: Number(categoryId) }),
        },
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
        },
      })
    })

    return success(post, '修改成功')
  } catch (e) {
    return fail('修改文章失败')
  }
}

// DELETE /api/posts/:id —— 删除文章（自动清除中间表 cascade）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = Number(id)
    if (isNaN(postId)) return fail('无效的文章ID')

    await prisma.post.delete({ where: { id: postId } })
    return success(null, '删除成功')
  } catch (e) {
    return fail('删除文章失败')
  }
}
