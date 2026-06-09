import { prisma } from '../../lib/prisma'
import { success, fail, serverError } from '../../lib/apiResponse'

// GET /api/categories —— 分类列表（含文章数统计）
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return success(categories)
  } catch (e) {
    return serverError('获取分类列表失败')
  }
}

// POST /api/categories —— 创建分类
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return fail('分类名称不能为空')
    }

    const category = await prisma.category.create({
      data: { name: body.name, description: body.description || null },
    })

    return success(category, '创建成功')
  } catch (e) {
    return fail('创建分类失败，名称可能已存在')
  }
}
