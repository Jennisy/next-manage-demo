# 文章管理系统 — 需求文档

## 一、背景与目标

基于现有的用户管理系统，新增**文章管理**模块，目的是学习和实践：

- 一对多关联（User → Post）
- 多对多关联（Post ↔ Tag，中间表）
- 嵌套查询（include / select）
- 聚合查询（groupBy、count）
- 复合条件筛选 + 分页
- 模糊搜索

---

## 二、数据模型设计

### 2.1 新增表

| 表名 | 说明 |
|------|------|
| `Post` | 文章表 |
| `Category` | 分类表 |
| `Tag` | 标签表 |
| `PostTag` | 文章-标签中间表（多对多） |

### 2.2 表结构

#### Post（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK, 自增) | 主键 |
| title | String(200) | 标题 |
| content | Text | 正文内容 |
| summary | String(500) | 摘要（可选） |
| status | Enum: draft/published | 状态：草稿/已发布 |
| authorId | Int (FK → User.id) | 作者（一对多） |
| categoryId | Int (FK → Category.id) | 所属分类（一对多） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### Category（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK, 自增) | 主键 |
| name | String(50) | 分类名称（唯一） |
| description | String(200) | 分类描述（可选） |
| createdAt | DateTime | 创建时间 |

#### Tag（标签）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK, 自增) | 主键 |
| name | String(30) | 标签名称（唯一） |
| createdAt | DateTime | 创建时间 |

#### PostTag（文章-标签中间表）

| 字段 | 类型 | 说明 |
|------|------|------|
| postId | Int (FK → Post.id) | 文章 ID |
| tagId | Int (FK → Tag.id) | 标签 ID |

> 联合主键：(postId, tagId)

### 2.3 关联关系

```
User  ──1:N──  Post        一个用户可以写多篇文章
Category ──1:N── Post      一个分类下有多篇文章
Post  ──M:N──  Tag         一篇文章可以有多个标签，一个标签可以标记多篇文章
```

---

## 三、API 接口设计

### 3.1 文章接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/posts | 文章列表（分页、筛选、搜索） | 登录用户 |
| GET | /api/posts/:id | 文章详情（含作者、分类、标签） | 登录用户 |
| POST | /api/posts | 创建文章 | 管理员/编辑 |
| PATCH | /api/posts/:id | 修改文章 | 管理员/作者本人 |
| DELETE | /api/posts/:id | 删除文章 | 管理员/作者本人 |

**GET /api/posts 查询参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码，默认 1 |
| pageSize | number | 每页条数，默认 10 |
| keyword | string | 模糊搜索（匹配标题） |
| categoryId | number | 按分类筛选 |
| tagId | number | 按标签筛选 |
| authorId | number | 按作者筛选 |
| status | string | 按状态筛选（draft/published） |

**响应格式（统一使用 apiResponse）**：

```json
{
  "code": 0,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "message": "ok"
}
```

### 3.2 分类接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/categories | 分类列表（含文章数统计） | 登录用户 |
| POST | /api/categories | 创建分类 | 管理员 |
| PATCH | /api/categories/:id | 修改分类 | 管理员 |
| DELETE | /api/categories/:id | 删除分类（有文章时禁止删除） | 管理员 |

### 3.3 标签接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/tags | 标签列表（含文章数统计） | 登录用户 |
| POST | /api/tags | 创建标签 | 管理员/编辑 |
| DELETE | /api/tags/:id | 删除标签（自动解除关联） | 管理员 |

### 3.4 统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stats/posts | 文章统计（每人发文数、每分类文章数） |

---

## 四、前端页面

### 4.1 页面列表

| 路径 | 页面 | 说明 |
|------|------|------|
| /posts | 文章列表 | 表格展示，支持搜索、筛选、分页 |
| /posts/new | 新建文章 | 表单：标题、正文、分类下拉、标签多选 |
| /posts/:id | 文章详情 | 展示完整内容、作者、分类、标签 |
| /posts/:id/edit | 编辑文章 | 复用新建表单 |
| /categories | 分类管理 | 列表 + 新增/编辑/删除 |
| /tags | 标签管理 | 列表 + 新增/删除 |

### 4.2 文章列表页功能

- 顶部搜索栏：关键词输入框 + 分类下拉 + 标签下拉 + 状态筛选
- 表格列：标题、作者、分类、标签（多个）、状态、创建时间、操作
- 操作：查看、编辑、删除
- 底部分页器

### 4.3 新建/编辑文章页

- 标题：文本输入
- 摘要：文本输入（可选）
- 正文：textarea（后续可升级为富文本）
- 分类：下拉单选
- 标签：多选（可新增标签）
- 状态：草稿 / 发布

---

## 五、学习重点（Prisma 查询技能）

通过本模块你将练习的核心查询：

### 5.1 一对多关联查询

```ts
// 查文章时带出作者和分类
prisma.post.findMany({
  include: { author: true, category: true }
})
```

### 5.2 多对多关联查询

```ts
// 查文章时带出所有标签
prisma.post.findMany({
  include: { tags: { include: { tag: true } } }
})
```

### 5.3 复合条件筛选

```ts
prisma.post.findMany({
  where: {
    title: { contains: keyword },
    categoryId: categoryId,
    status: 'published',
    tags: { some: { tagId: tagId } }
  }
})
```

### 5.4 分页

```ts
prisma.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})
```

### 5.5 聚合统计

```ts
// 每个作者发了多少篇文章
prisma.post.groupBy({
  by: ['authorId'],
  _count: { id: true }
})

// 每个分类有多少篇文章
prisma.category.findMany({
  include: { _count: { select: { posts: true } } }
})
```

---

## 六、实施步骤建议

| 步骤 | 内容 | 涉及技能 |
|------|------|----------|
| 1 | 设计 Prisma Schema，建表 migrate | 模型定义、关联声明 |
| 2 | 写种子数据（seed） | 关联数据的批量创建 |
| 3 | 实现分类 CRUD 接口 | 基础一对多 |
| 4 | 实现标签 CRUD 接口 | 基础操作 |
| 5 | 实现文章 CRUD 接口 | 一对多 + 多对多 + 筛选 + 分页 |
| 6 | 实现统计接口 | groupBy + count 聚合 |
| 7 | 前端文章列表页 | 分页 + 筛选交互 |
| 8 | 前端新建/编辑/详情页 | 表单 + 多选标签 |
| 9 | 前端分类/标签管理页 | 简单 CRUD 页面 |
| 10 | 侧边栏导航更新 | 添加新菜单项 |

---

## 七、注意事项

1. 删除分类时需检查是否有文章引用，有则拒绝删除
2. 删除标签时自动清除中间表记录（cascade）
3. 删除文章时自动清除中间表记录（cascade）
4. 文章列表接口同时返回 total 用于前端分页
5. 创建/编辑文章时，标签处理逻辑：先删除旧关联，再建立新关联（deleteMany + createMany）
