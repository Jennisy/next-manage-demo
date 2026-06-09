'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { get } from '../../../lib/api'
import styles from './page.module.css'

interface PostDetail {
  id: number
  title: string
  content: string
  summary: string | null
  status: string
  createdAt: string
  updatedAt: string
  author: { id: number; name: string }
  category: { id: number; name: string }
  tags: { tag: { id: number; name: string } }[]
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get<PostDetail>(`/posts/${id}`)
      .then(setPost)
      .catch(() => alert('加载文章失败'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>加载中...</div>
  if (!post) return <div>文章不存在</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/posts" className={styles.backLink}>← 返回列表</Link>
        <Link href={`/posts/${post.id}/edit`} className={styles.editLink}>编辑</Link>
      </div>

      <h1 className={styles.title}>{post.title}</h1>

      <div className={styles.meta}>
        <span>作者：{post.author.name}</span>
        <span>分类：{post.category.name}</span>
        <span className={`${styles.statusBadge} ${post.status === 'published' ? styles.published : styles.draft}`}>
          {post.status === 'published' ? '已发布' : '草稿'}
        </span>
        <span>创建：{new Date(post.createdAt).toLocaleString()}</span>
      </div>

      {post.tags.length > 0 && (
        <div className={styles.tagList}>
          {post.tags.map((pt) => (
            <span key={pt.tag.id} className={styles.tagBadge}>{pt.tag.name}</span>
          ))}
        </div>
      )}

      {post.summary && <p className={styles.summary}>{post.summary}</p>}

      <div className={styles.content}>{post.content}</div>
    </div>
  )
}
