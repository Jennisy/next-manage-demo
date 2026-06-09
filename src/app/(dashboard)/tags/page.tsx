'use client'

import { useEffect, useState } from 'react'
import { get, post, del } from '../../lib/api'
import styles from './page.module.css'

interface Tag {
  id: number
  name: string
  createdAt: string
  _count: { posts: number }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const fetchTags = async () => {
    try {
      const data = await get<Tag[]>('/tags')
      setTags(data)
    } catch (e) {
      console.error('获取标签失败', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTags() }, [])

  const handleSubmit = async () => {
    if (!name.trim()) return alert('标签名称不能为空')
    try {
      await post('/tags', { name })
      setName('')
      setShowForm(false)
      fetchTags()
    } catch (e) {
      alert(e instanceof Error ? e.message : '创建失败')
    }
  }

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`确定删除标签「${tag.name}」？关联的文章将自动解除该标签。`)) return
    try {
      await del(`/tags/${tag.id}`)
      fetchTags()
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>标签管理</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + 新增标签
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <input
            className={styles.input}
            placeholder="标签名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={styles.formActions}>
            <button className={styles.submitBtn} onClick={handleSubmit}>创建</button>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setName('') }}>取消</button>
          </div>
        </div>
      )}

      <div className={styles.tagGrid}>
        {tags.map((tag) => (
          <div key={tag.id} className={styles.tagCard}>
            <span className={styles.tagName}>{tag.name}</span>
            <span className={styles.tagCount}>{tag._count.posts} 篇文章</span>
            <button className={styles.deleteBtn} onClick={() => handleDelete(tag)}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
