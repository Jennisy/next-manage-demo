'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { post } from '../lib/api'
import styles from './Nav.module.css'

const navItems = [
  { href: '/', label: '仪表盘' },
  { href: '/posts', label: '文章管理' },
  { href: '/categories', label: '分类管理' },
  { href: '/tags', label: '标签管理' },
  { href: '/users', label: '用户列表' },
  { href: '/about', label: '关于' },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    try {
      await post('/auth/logout', {})
    } catch { /* ignore */ }
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.link} ${isActive ? styles.active : ''}`}
          >
            {item.label}
          </Link>
        )
      })}
      <button className={styles.logout} onClick={handleLogout}>
        退出登录
      </button>
    </nav>
  )
}
