// ============================================
// auth.ts —— 认证工具函数
// ============================================
// 职责：JWT 签发/验证、密码 hash/比对
// JWT 存储在 cookie 中，httpOnly 防止 XSS
// ============================================

import jwt from 'jsonwebtoken'
// bcryptjs：单向密码 hash 工具库（纯 JS 实现，兼容性比 bcrypt 好）
// 作用：把明文密码转成不可逆的加密字符串存库，即使数据库泄露也拿不回明文
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// JWT 密钥，从环境变量 .env 读取
// 生产部署时必须配置为随机字符串，本地未配置时用默认值（仅用于开发）
const JWT_SECRET: string =
  process.env.JWT_SECRET || 'next-manage-secret-key'

// Token 有效期：7 天
const TOKEN_EXPIRES = '7d'

// Cookie 名称
export const TOKEN_COOKIE = 'token'

/** JWT payload 结构 */
export interface JwtPayload {
  userId: number
  email: string
  role: string
}

/**
 * 对明文密码进行 hash
 * @param password - 明文密码（如 '123456'）
 * @returns hash 后的不可逆字符串（如 '$2a$10$xyz...'）
 *
 * bcrypt.hash 做了什么：
 *   1. 生成一个随机 salt（盐值，每次不同）
 *   2. 把 salt + 密码一起经过 Blowfish 算法多轮计算
 *   3. 输出格式：'$2a$<cost>$<salt><hash>'，salt 也嵌入在输出中，比对时不用再存一份
 *
 * 参数 10 = cost factor（轮数，2^10 = 1024 轮）
 *   - 数值越大越慢、越安全
 *   - 常用范围 10-12，低于 8 会被视为弱，不建议超过 14（性能影响明显）
 *
 * 重要特性：同一个密码每次 hash 结果都不同（因为 salt 不同），所以不能直接字符串比较
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * 验证密码是否匹配
 * @param password - 用户输入的明文密码
 * @param hash - 数据库中存储的 bcrypt hash 字符串
 * @returns 是否匹配（true = 密码正确）
 *
 * bcrypt.compare 做了什么：
 *   1. 从 hash 字符串中解析出原来的 salt 和 cost
 *   2. 用相同的 salt + cost 重新 hash 用户输入的密码
 *   3. 比较两个 hash 结果是否一致
 *
 * 为什么用 compare 而不是自己 hash 再对比：
 *   bcrypt 内部有 constant-time comparison，防止"时间攻击"（timing attack）
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * 签发 JWT token
 * @param payload - 用户信息
 * @returns token 字符串
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
}

/**
 * 验证并解析 JWT token
 * @param token - token 字符串
 * @returns 解析后的 payload，失败返回 null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

/**
 * 从请求 cookie 中获取当前登录用户信息
 * @returns 用户 payload，未登录返回 null
 */
export async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
