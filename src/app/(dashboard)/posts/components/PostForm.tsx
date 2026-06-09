'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { get, post, patch } from '../../../lib/api'
import styles from './PostForm.module.css'

interface Category { id: number; name: string }
interface Tag { id: number; name: string }
interface PostData {
  id: number
  title: string
  content: string
  summary: string | null
  status: string
  categoryId: number
  author: { id: number; name: string }
  tags: { tag: { id: number; name: string } }[]
}

interface Props {
  postId?: number // 有值=编辑模式
}

export default function PostForm({ postId }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState('draft')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    get<Category[]>('/categories').then(setCategories).catch(() => {})
    get<Tag[]>('/tags').then(setTags).catch(() => {})

    if (postId) {
      get<PostData>(`/posts/${postId}`).then((data) => {
        setTitle(data.title)
        setContent(data.content)
        setSummary(data.summary || '')
        setStatus(data.status)
        setCategoryId(String(data.categoryId))
        setSelectedTagIds(data.tags.map((pt) => pt.tag.id))
      }).catch(() => alert('加载文章失败'))
    }
  }, [postId])

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      return alert('标题、正文和分类不能为空')
    }
    setSubmitting(true)
    try {
      const body = {
        title,
        content,
        summary: summary || null,
        status,
        categoryId: Number(categoryId),
        tagIds: selectedTagIds,
        authorId: 1, // 暂用作者ID=1，后续改为从登录态获取
      }
      if (postId) {
        await patch(`/posts/${postId}`, body)
      } else {
        await post('/posts', body)
      }
      router.push('/posts')
    } catch (e) {
      alert(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{postId ? '编辑文章' : '新建文章'}</h1>

      <div className={styles.formGroup}>
        <label className={styles.label}>标题</label>
        <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>摘要（可选）</label>
        <input className={styles.input} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="简短摘要" />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>正文</label>
        <textarea className={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)} placeholder="文章正文内容" rows={12} />
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>分类</label>
          <select className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">请选择分类</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>状态</label>
          <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>标签（多选）</label>
        <div className={styles.tagSelector}>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`${styles.tagOption} ${selectedTagIds.includes(tag.id) ? styles.tagSelected : ''}`}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '保存中...' : postId ? '保存修改' : '创建文章'}
        </button>
        <button className={styles.cancelBtn} onClick={() => router.push('/posts')}>取消</button>
      </div>
    </div>
  )
}
