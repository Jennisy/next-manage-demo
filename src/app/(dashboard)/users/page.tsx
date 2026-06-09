'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { get, post } from '../../lib/api'
import styles from './page.module.css'
import UserFormModal from './components/UserFormModal'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

function getRoleClass(role: string) {
  if (role === '管理员') return styles.roleAdmin
  if (role === '编辑') return styles.roleEditor
  return styles.roleGuest
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const data = await get<User[]>('/users')
      setUsers(data)
    } catch (e) {
      console.error('获取用户列表失败', e)
    } finally {
      setLoading(false)
    }
  }

  // 重置密码：调用后端将该用户密码重置为默认密码（hash 后入库）
  const handleResetPassword = async (user: User): Promise<void> => {
    if (!confirm(`确定要重置用户 【${user.name}】 的密码吗？`)) {
      return
    }
    try {
      const result: { defaultPassword: string } = await post<{
        defaultPassword: string
      }>(`/users/${user.id}/reset-password`, {})
      alert(`重置成功，新密码为：${result.defaultPassword}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : '重置密码失败')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1 className={styles.title}>用户列表</h1>
        <UserFormModal onSuccess={fetchUsers} />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>姓名</th>
              <th className={styles.th}>邮箱</th>
              <th className={styles.th}>角色</th>
              <th className={styles.th}>状态</th>
              <th className={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.row}>
                <td className={styles.td}>{user.id}</td>
                <td className={styles.td}>{user.name}</td>
                <td className={styles.emailTd}>{user.email}</td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${getRoleClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className={styles.td}>
                  <span
                    className={`${styles.badge} ${
                      user.status === '活跃' ? styles.statusActive : styles.statusInactive
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actionGroup}>
                    <Link href={`/users/${user.id}`} className={styles.detailLink}>
                      查看详情
                    </Link>
                    <button
                      type="button"
                      className={styles.resetBtn}
                      onClick={() => handleResetPassword(user)}
                    >
                      重置密码
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
