'use client'

import { useEffect, useState } from 'react'
import { get, post, patch, del } from '../../lib/api'
import styles from './page.module.css'

interface Category {
  id: number
  name: string
  description: string | null
  createdAt: string
  _count: { posts: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchCategories = async () => {
    try {
      const data = await get<Category[]>('/categories')
      setCategories(data)
    } catch (e) {
      console.error('获取分类失败', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return alert('分类名称不能为空')
    try {
      if (editingId) {
        await patch(`/categories/${editingId}`, { name, description })
      } else {
        await post('/categories', { name, description })
      }
      resetForm()
      fetchCategories()
    } catch (e) {
      alert(e instanceof Error ? e.message : '操作失败')
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setDescription(cat.description || '')
    setShowForm(true)
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`确定删除分类「${cat.name}」？`)) return
    try {
      await del(`/categories/${cat.id}`)
      fetchCategories()
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>分类管理</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + 新增分类
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <input
            className={styles.input}
            placeholder="分类名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="分类描述（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className={styles.formActions}>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              {editingId ? '保存修改' : '创建'}
            </button>
            <button className={styles.cancelBtn} onClick={resetForm}>取消</button>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>名称</th>
              <th className={styles.th}>描述</th>
              <th className={styles.th}>文章数</th>
              <th className={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className={styles.row}>
                <td className={styles.td}>{cat.id}</td>
                <td className={styles.td}>{cat.name}</td>
                <td className={styles.td}>{cat.description || '-'}</td>
                <td className={styles.td}>{cat._count.posts}</td>
                <td className={styles.td}>
                  <div className={styles.actionGroup}>
                    <button className={styles.editBtn} onClick={() => handleEdit(cat)}>编辑</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(cat)}>删除</button>
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
