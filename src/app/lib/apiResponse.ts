// ============================================
// apiResponse.ts —— 统一 API 响应格式封装
// ============================================
// 作用：所有后端接口统一响应结构，前端只需判断 code === 0
// 响应格式：{ code, data, message }
//   - code: 0 表示成功，非 0 为业务错误码
//   - data: 成功时返回的数据，失败时为 null
//   - message: 提示信息
// ============================================

import { NextResponse } from 'next/server'

/** 统一响应体结构 */
interface ApiResult<T = unknown> {
  code: number
  data: T | null
  message: string
}

/**
 * 成功响应
 * @param data - 返回的数据
 * @param message - 提示信息，默认 "ok"
 */
export function success<T>(data: T, message = 'ok'): NextResponse<ApiResult<T>> {
  return NextResponse.json({ code: 0, data, message })
}

/**
 * 失败响应（业务错误）
 * @param message - 错误提示
 * @param code - 业务错误码，默认 -1
 */
export function fail(message: string, code = -1): NextResponse<ApiResult<null>> {
  return NextResponse.json({ code, data: null, message })
}

/**
 * 未授权（HTTP 401）
 * @param message - 提示信息
 */
export function unauthorized(message = '未登录或登录已过期'): NextResponse<ApiResult<null>> {
  return NextResponse.json({ code: 401, data: null, message }, { status: 401 })
}

/**
 * 无权限（HTTP 403）
 * @param message - 提示信息
 */
export function forbidden(message = '无权限访问'): NextResponse<ApiResult<null>> {
  return NextResponse.json({ code: 403, data: null, message }, { status: 403 })
}

/**
 * 服务器错误（HTTP 500）
 * @param message - 错误信息
 */
export function serverError(message = '服务器内部错误'): NextResponse<ApiResult<null>> {
  return NextResponse.json({ code: 500, data: null, message }, { status: 500 })
}
