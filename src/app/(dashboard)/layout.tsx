import { Nav } from '../components/Nav'
import styles from './layout.module.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.container}>
      <aside className={styles.aside}>
        <div className={styles.logo}>Next 后台</div>
        <Nav />
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
