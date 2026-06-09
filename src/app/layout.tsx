import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '用户管理系统',
  description: 'Next.js 学习 Demo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
