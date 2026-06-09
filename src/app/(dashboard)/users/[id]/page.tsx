'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { get, patch, del } from '../../../lib/api'
import styles from './page.module.css'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: '', status: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    get<User>(`/users/${id}`)
      .then((data) => {
        setUser(data)
        setForm({ name: data.name, email: data.email, role: data.role, status: data.status })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await patch<User>(`/users/${id}`, form)
      setUser(updated)
      setEditing(false)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除该用户吗？')) return
    try {
      await del(`/users/${id}`)
      router.push('/users')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误：{error}</div>
  if (!user) return <div>用户不存在</div>

  return (
    <div>
      <Link href="/users" className={styles.backLink}>
        ← 返回列表
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>用户详情</h1>
        <div className={styles.actions}>
          {!editing && (
            <button className={styles.editBtn} onClick={() => setEditing(true)}>
              编辑
            </button>
          )}
          <button className={styles.deleteBtn} onClick={handleDelete}>
            删除
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <DetailItem label="ID" value={String(user.id)} />

        {editing ? (
          <>
            <div className={styles.detailItem}>
              <span className={styles.label}>姓名</span>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>邮箱</span>
              <input
                className={styles.input}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>角色</span>
              <select
                className={styles.input}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="管理员">管理员</option>
                <option value="编辑">编辑</option>
                <option value="访客">访客</option>
              </select>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>状态</span>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="活跃">活跃</option>
                <option value="离线">离线</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
              <button className={styles.cancelBtn} onClick={() => setEditing(false)}>
                取消
              </button>
            </div>
          </>
        ) : (
          <>
            <DetailItem label="姓名" value={user.name} />
            <DetailItem label="邮箱" value={user.email} />
            <DetailItem label="角色" value={user.role} />
            <DetailItem label="状态" value={user.status} />
          </>
        )}

        <DetailItem label="创建时间" value={user.createdAt} />
      </div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  )
}
