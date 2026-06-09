import { prisma } from '../../lib/prisma'
import { success, fail, serverError } from '../../lib/apiResponse'
import { hashPassword } from '../../lib/auth'

// 新建用户时，未传密码则使用默认密码（hash 后入库）
const DEFAULT_PASSWORD = '654321'

// GET /api/users —— 获取用户列表
export async function GET() {
  try {
    const users = await prisma.user.findMany()
    return success(users)
  } catch (e) {
    return serverError('获取用户列表失败')
  }
}

// POST /api/users —— 创建新用户
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 简单校验必填字段
    if (!body.name || !body.email) {
      return fail('姓名和邮箱不能为空')
    }

    // 未传密码则使用默认密码 654321；统一 bcrypt hash 存储，避免明文落库
    const plainPassword: string = body.password || DEFAULT_PASSWORD
    const hashedPassword: string = await hashPassword(plainPassword)

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role || '访客',
        status: body.status || '活跃',
      },
    })

    return success(user, '创建成功')
  } catch (error) {
    return fail('创建用户失败，邮箱可能已存在')
  }
}
