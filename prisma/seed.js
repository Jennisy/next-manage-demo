const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 1. 创建用户
  const users = await prisma.user.createMany({
    data: [
      { name: '张三', email: 'zhangsan@example.com', password: '123456', role: '管理员', status: '活跃' },
      { name: '李四', email: 'lisi@example.com', password: '123456', role: '编辑', status: '活跃' },
      { name: '王五', email: 'wangwu@example.com', password: '123456', role: '访客', status: '离线' },
    ],
    skipDuplicates: true,
  })
  console.log(`✅ 成功创建 ${users.count} 条用户数据`)

  // 2. 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: '前端开发' }, update: {}, create: { name: '前端开发', description: 'HTML/CSS/JS/React/Vue 等前端技术' } }),
    prisma.category.upsert({ where: { name: '后端开发' }, update: {}, create: { name: '后端开发', description: 'Node.js/Java/Go 等后端技术' } }),
    prisma.category.upsert({ where: { name: '数据库' }, update: {}, create: { name: '数据库', description: 'MySQL/PostgreSQL/MongoDB 等' } }),
    prisma.category.upsert({ where: { name: '运维部署' }, update: {}, create: { name: '运维部署', description: 'Docker/K8s/CI/CD 等' } }),
  ])
  console.log(`✅ 成功创建 ${categories.length} 条分类数据`)

  // 3. 创建标签
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name: 'React' }, update: {}, create: { name: 'React' } }),
    prisma.tag.upsert({ where: { name: 'Next.js' }, update: {}, create: { name: 'Next.js' } }),
    prisma.tag.upsert({ where: { name: 'TypeScript' }, update: {}, create: { name: 'TypeScript' } }),
    prisma.tag.upsert({ where: { name: 'Prisma' }, update: {}, create: { name: 'Prisma' } }),
    prisma.tag.upsert({ where: { name: 'CSS' }, update: {}, create: { name: 'CSS' } }),
    prisma.tag.upsert({ where: { name: 'Node.js' }, update: {}, create: { name: 'Node.js' } }),
  ])
  console.log(`✅ 成功创建 ${tags.length} 条标签数据`)

  // 4. 获取用户 ID（用于关联文章）
  const zhangsan = await prisma.user.findUnique({ where: { email: 'zhangsan@example.com' } })
  const lisi = await prisma.user.findUnique({ where: { email: 'lisi@example.com' } })

  if (zhangsan && lisi) {
    // 5. 创建文章（含标签关联）
    const post1 = await prisma.post.create({
      data: {
        title: 'Next.js App Router 入门指南',
        content: '本文介绍 Next.js 15 的 App Router 架构，包括路由组、布局嵌套、服务端组件等核心概念。',
        summary: 'Next.js App Router 核心概念入门',
        status: 'published',
        authorId: zhangsan.id,
        categoryId: categories[0].id,
        tags: { create: [{ tagId: tags[0].id }, { tagId: tags[1].id }, { tagId: tags[2].id }] },
      },
    })

    const post2 = await prisma.post.create({
      data: {
        title: 'Prisma ORM 关联查询详解',
        content: '深入讲解 Prisma 的 include、select、关联过滤、聚合查询等高级用法。',
        summary: 'Prisma 关联查询高级用法',
        status: 'published',
        authorId: zhangsan.id,
        categoryId: categories[2].id,
        tags: { create: [{ tagId: tags[2].id }, { tagId: tags[3].id }] },
      },
    })

    const post3 = await prisma.post.create({
      data: {
        title: 'CSS Module 与样式隔离',
        content: '探讨 CSS Module 在 Next.js 中的最佳实践，避免样式污染。',
        summary: null,
        status: 'draft',
        authorId: lisi.id,
        categoryId: categories[0].id,
        tags: { create: [{ tagId: tags[4].id }, { tagId: tags[0].id }] },
      },
    })

    console.log(`✅ 成功创建 3 篇文章: ${post1.title}, ${post2.title}, ${post3.title}`)
  }

  const allUsers = await prisma.user.findMany()
  console.log('\n📋 当前 users 表中的所有数据：')
  console.table(allUsers)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
