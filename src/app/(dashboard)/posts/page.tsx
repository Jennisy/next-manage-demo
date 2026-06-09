'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { get, del } from '../../lib/api'
import styles from './page.module.css'

interface Post {
  id: number
  title: string
  status: string
  createdAt: string
  author: { id: number; name: string }
  category: { id: number; name: string }
  tags: { tag: { id: number; name: string } }[]
}

interface Category { id: number; name: string }
interface Tag { id: number; name: string }

interface PostListResponse {
  list: Post[]
  total: number
  page: number
  pageSize: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagId, setTagId] = useState('')
  const [status, setStatus] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const pageSize = 10

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (keyword) params.set('keyword', keyword)
      if (categoryId) params.set('categoryId', categoryId)
      if (tagId) params.set('tagId', tagId)
      if (status) params.set('status', status)

      const data = await get<PostListResponse>(`/posts?${params}`)
      setPosts(data.list)
      setTotal(data.total)
    } catch (e) {
      console.error('获取文章列表失败', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 加载筛选选项
    get<Category[]>('/categories').then(setCategories).catch(() => {})
    get<Tag[]>('/tags').then(setTags).catch(() => {})
  }, [])

  useEffect(() => { fetchPosts() }, [page, categoryId, tagId, status])

  const handleSearch = () => { setPage(1); fetchPosts() }

  const handleDelete = async (post: Post) => {
    if (!confirm(`确定删除文章「${post.title}」？`)) return
    try {
      await del(`/posts/${post.id}`)
      fetchPosts()
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>文章管理</h1>
        <Link href="/posts/new" className={styles.addBtn}>+ 新建文章</Link>
      </div>

      {/* 筛选栏 */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="搜索标题..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select className={styles.select} value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}>
          <option value="">全部分类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className={styles.select} value={tagId} onChange={(e) => { setTagId(e.target.value); setPage(1) }}>
          <option value="">全部标签</option>
          {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select className={styles.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        <button className={styles.searchBtn} onClick={handleSearch}>搜索</button>
      </div>

      {/* 表格 */}
      {loading ? <div>加载中...</div> : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>标题</th>
                <th className={styles.th}>作者</th>
                <th className={styles.th}>分类</th>
                <th className={styles.th}>标签</th>
                <th className={styles.th}>状态</th>
                <th className={styles.th}>创建时间</th>
                <th className={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className={styles.row}>
                  <td className={styles.td}>{post.title}</td>
                  <td className={styles.td}>{post.author.name}</td>
                  <td className={styles.td}>{post.category.name}</td>
                  <td className={styles.td}>
                    <div className={styles.tagList}>
                      {post.tags.map((pt) => (
                        <span key={pt.tag.id} className={styles.tagBadge}>{pt.tag.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${post.status === 'published' ? styles.published : styles.draft}`}>
                      {post.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className={styles.td}>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className={styles.td}>
                    <div className={styles.actionGroup}>
                      <Link href={`/posts/${post.id}`} className={styles.viewBtn}>查看</Link>
                      <Link href={`/posts/${post.id}/edit`} className={styles.editBtn}>编辑</Link>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(post)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
          <span>{page} / {totalPages}（共 {total} 条）</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
        </div>
      )}
    </div>
  )
}
