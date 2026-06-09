// ============================================
// data.ts —— 数据获取层（Service Layer）
// ============================================
// 作用：把所有数据库查询逻辑集中到这里，页面组件只负责渲染
// 好处：
//   1. 复用性：多个页面需要用户数据时直接 import getUsers
//   2. 可测试性：数据逻辑单独测试，不依赖页面
//   3. 关注点分离：页面只管 UI，数据逻辑独立维护
// ============================================

import { prisma } from './prisma'

// User 类型定义（与页面组件共享使用）
export interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

/**
 * 从数据库获取所有用户
 * @returns 用户列表
 */
export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany()

  // Prisma 返回的 createdAt 是 Date 对象，转成字符串给前端用
  const result: User[] = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }))

  return result
}

/**
 * 从数据库获取单个用户
 * @param id - 用户 ID
 * @returns 用户对象，不存在则返回 null
 */
export async function getUserById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  return { ...user, createdAt: user.createdAt.toISOString() }
}

/**
 * 更新用户信息
 * @param id - 用户 ID
 * @param data - 要更新的字段
 * @returns 更新后的用户对象，不存在则返回 null
 */
export async function updateUser(
  id: number,
  data: Partial<Pick<User, 'name' | 'email' | 'role' | 'status'>>
): Promise<User | null> {
  const user = await prisma.user.update({ where: { id }, data })
  return { ...user, createdAt: user.createdAt.toISOString() }
}

/**
 * 删除用户
 * @param id - 用户 ID
 */
export async function deleteUser(id: number): Promise<void> {
  await prisma.user.delete({ where: { id } })
}

// ============================================
// 以下 mock 数据已废弃，保留仅供历史参考
// ============================================
// export const users: User[] = [
//   { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: '活跃', createdAt: '2024-01-15' },
//   ...
// ]
