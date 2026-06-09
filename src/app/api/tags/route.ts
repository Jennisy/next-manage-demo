import { prisma } from '../../lib/prisma'
import { success, fail, serverError } from '../../lib/apiResponse'

// GET /api/tags —— 标签列表（含文章数统计）
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return success(tags)
  } catch (e) {
    return serverError('获取标签列表失败')
  }
}

// POST /api/tags —— 创建标签
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return fail('标签名称不能为空')
    }

    const tag = await prisma.tag.create({ data: { name: body.name } })
    return success(tag, '创建成功')
  } catch (e) {
    return fail('创建标签失败，名称可能已存在')
  }
}
