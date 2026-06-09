import styles from './page.module.css'

export default function AboutPage() {
  return (
    <div>
      <h1 className={styles.title}>关于这个项目</h1>

      <div className={styles.content}>
        <p className={styles.paragraph}>
          这是一个用来学习 <strong>Next.js</strong> 的 Demo 项目。
        </p>

        <p className={styles.paragraph}>我们会逐步学习以下内容：</p>

        <ul className={styles.list}>
          <li>App Router 路由和页面结构</li>
          <li>Layout 共享布局</li>
          <li>Server Component 和 Client Component</li>
          <li>数据获取（fetch、SSG、SSR）</li>
          <li>API Route Handlers</li>
          <li>动态路由</li>
          <li>表单和客户端交互</li>
        </ul>

        <p className={styles.techInfo}>技术栈：Next.js 16 + React 19 + TypeScript</p>
      </div>
    </div>
  )
}
