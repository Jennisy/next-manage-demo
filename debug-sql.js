const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query'],  // ← 开启 SQL 日志
})

async function main() {
  const users = await prisma.user.findMany({
    where: { role: '管理员' },
    take: 2,
  })
  console.log('结果:', users)
}

main().finally(() => prisma.$disconnect())
