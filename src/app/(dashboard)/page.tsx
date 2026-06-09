import { Card } from '../components/Card'
import styles from './page.module.css'

// 阶段一：静态页面，展示仪表盘概览
export default function HomePage() {
  const stats = [
    { title: '总用户数', value: 128, color: '#4fc3f7' },
    { title: '今日新增', value: 12, color: '#81c784' },
    { title: '活跃用户', value: 86, color: '#ffb74d' },
    { title: '待审核', value: 5, color: '#e57373' },
  ]

  return (
    <div>
      <h1 className={styles.title}>仪表盘</h1>
      <div className={styles.grid}>
        {stats.map((s) => (
          <Card key={s.title} title={s.title} value={s.value} color={s.color} />
        ))}
      </div>
    </div>
  )
}
