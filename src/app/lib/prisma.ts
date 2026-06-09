// ============================================
// prisma.ts —— Prisma 数据库连接单例文件
// ============================================
// 作用：防止 Next.js 开发模式下热重载时反复创建数据库连接
// 用法：所有需要操作数据库的地方，都从这里引入 prisma
//       import { prisma } from './lib/prisma'
// ============================================

// 从 @prisma/client 引入 PrismaClient 类
// 这是 Prisma 自动生成的一个"数据库操作客户端"
import { PrismaClient } from '@prisma/client'

// 把 Node.js 全局对象 global 强转成带有 prisma 属性的类型
// 目的是：在 global 对象上挂一个 "prisma" 属性，用来缓存数据库连接实例
// global 在 Node.js 里是一个全局变量，整个进程内共享，热重载时也不会丢失
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 创建（或复用）PrismaClient 实例：
// 1. 先看 global 上有没有已经创建好的 prisma 实例
// 2. 如果有，直接复用（避免重复创建连接）
// 3. 如果没有，new PrismaClient() 创建一个新的
export const prisma = globalForPrisma.prisma || new PrismaClient()

// 开发模式下（NODE_ENV !== 'production'），把创建好的实例挂到 global 上缓存
// 这样下次热重载时，globalForPrisma.prisma 就不为空，直接复用旧的
// 生产环境不需要缓存，因为生产不会热重载
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
