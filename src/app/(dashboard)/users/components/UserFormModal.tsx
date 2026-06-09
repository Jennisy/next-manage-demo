'use client'

import { useState } from 'react'
import { post } from '../../../lib/api'
import styles from './UserFormModal.module.css'

export default function UserFormModal({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '访客',
    status: '活跃',
  })

  const openModal = () => setIsOpen(true)

  const closeModal = () => {
    setIsOpen(false)
    setForm({ name: '', email: '', role: '访客', status: '活跃' })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await post('/users', form)
      closeModal()
      onSuccess?.()
    } catch (err: any) {
      alert(err.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={openModal} className={styles.addButton}>
        + 新增用户
      </button>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className={styles.modal}>
            <h2 className={styles.title}>新增用户</h2>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>姓名 *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>邮箱 *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>角色</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="访客">访客</option>
                  <option value="编辑">编辑</option>
                  <option value="管理员">管理员</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>状态</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="活跃">活跃</option>
                  <option value="离线">离线</option>
                </select>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelButton}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? '提交中...' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
