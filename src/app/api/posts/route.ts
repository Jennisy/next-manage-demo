import { prisma } from '../../lib/prisma'
import { success, fail, serverError } from '../../lib/apiResponse'

// GET /api/posts —— 文章列表（分页 + 筛选 + 搜索 + 关联查询）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || 10))
    const keyword = searchParams.get('keyword') || ''
    const categoryId = searchParams.get('categoryId')
    const tagId = searchParams.get('tagId')
    const authorId = searchParams.get('authorId')
    const status = searchParams.get('status')

    // 构建 where 条件
    const where: Record<string, unknown> = {}
    if (keyword) where.title = { contains: keyword }
    if (categoryId) where.categoryId = Number(categoryId)
    if (authorId) where.authorId = Number(authorId)
    if (status) where.status = status
    if (tagId) where.tags = { some: { tagId: Number(tagId) } }

    const [list, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ])

    return success({ list, total, page, pageSize })
  } catch (e) {
    return serverError('获取文章列表失败')
  }
}

// POST /api/posts —— 创建文章
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.content || !body.categoryId || !body.authorId) {
      return fail('标题、正文、分类和作者不能为空')
    }

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        summary: body.summary || null,
        status: body.status || 'draft',
        authorId: Number(body.authorId),
        categoryId: Number(body.categoryId),
        tags: body.tagIds?.length
          ? { create: body.tagIds.map((tagId: number) => ({ tagId })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    })

    return success(post, '创建成功')
  } catch (e) {
    return fail('创建文章失败')
  }
}
