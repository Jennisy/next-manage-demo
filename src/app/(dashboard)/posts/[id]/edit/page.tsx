'use client'

import { use } from 'react'
import PostForm from '../../components/PostForm'

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PostForm postId={Number(id)} />
}
