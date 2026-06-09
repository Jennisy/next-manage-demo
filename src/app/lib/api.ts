// ============================================
// api.ts —— HTTP 请求封装工具
// ============================================
// 作用：统一封装 fetch，自动处理 baseURL、错误、JSON 解析
// 适配后端统一响应格式：{ code, data, message }
// ============================================

/** 后端统一响应结构 */
interface ApiResult<T = unknown> {
  code: number
  data: T | null
  message: string
}

/**
 * 发送 GET 请求
 * @param path - API 路径，如 '/users'
 * @returns 解析后的业务数据（自动提取 data 字段）
 * @throws 当 code !== 0 时抛出错误（含 message）
 */
export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { cache: 'no-store' })

  // HTTP 层异常（网络错误、服务器崩溃等）
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }

  const json: ApiResult<T> = await res.json()

  // 业务层异常（code !== 0 表示业务逻辑失败）
  if (json.code !== 0) {
    throw new Error(json.message || '请求失败')
  }

  return json.data as T
}

/**
 * 发送 POST 请求
 * @param path - API 路径
 * @param body - 请求体数据
 * @returns 解析后的业务数据
 */
export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }

  const json: ApiResult<T> = await res.json()

  if (json.code !== 0) {
    throw new Error(json.message || '请求失败')
  }

  return json.data as T
}

/**
 * 发送 PATCH 请求
 * @param path - API 路径
 * @param body - 请求体数据
 * @returns 解析后的业务数据
 */
export async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }

  const json: ApiResult<T> = await res.json()

  if (json.code !== 0) {
    throw new Error(json.message || '请求失败')
  }

  return json.data as T
}

/**
 * 发送 DELETE 请求
 * @param path - API 路径
 * @returns 解析后的业务数据
 */
export async function del<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { method: 'DELETE' })

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }

  const json: ApiResult<T> = await res.json()

  if (json.code !== 0) {
    throw new Error(json.message || '请求失败')
  }

  return json.data as T
}
