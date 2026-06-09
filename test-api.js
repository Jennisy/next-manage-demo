// 临时测试：直接验证 prisma 查询结果
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('数据库查询结果：')
  console.log(JSON.stringify(users, null, 2))
}

main().finally(() => prisma.$disconnect())
