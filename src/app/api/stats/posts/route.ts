import { prisma } from '../../../lib/prisma'
import { success, serverError } from '../../../lib/apiResponse'

// GET /api/stats/posts —— 文章统计
export async function GET() {
  try {
    const [byAuthor, byCategory, total, published, draft] = await Promise.all([
      // 每个作者发文数
      prisma.post.groupBy({
        by: ['authorId'],
        _count: { id: true },
      }),
      // 每个分类文章数
      prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
      }),
      prisma.post.count(),
      prisma.post.count({ where: { status: 'published' } }),
      prisma.post.count({ where: { status: 'draft' } }),
    ])

    // 补充作者姓名
    const authorIds = byAuthor.map((item) => item.authorId)
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true },
    })
    const authorMap = Object.fromEntries(authors.map((a) => [a.id, a.name]))

    const authorStats = byAuthor.map((item) => ({
      authorId: item.authorId,
      authorName: authorMap[item.authorId] || '未知',
      count: item._count.id,
    }))

    const categoryStats = byCategory.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      count: cat._count.posts,
    }))

    return success({ total, published, draft, byAuthor: authorStats, byCategory: categoryStats })
  } catch (e) {
    return serverError('获取统计数据失败')
  }
}
