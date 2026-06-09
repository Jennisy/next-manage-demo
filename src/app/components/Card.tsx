import styles from './Card.module.css'

interface CardProps {
  title: string
  value: number
  color: string
}

export function Card({ title, value, color }: CardProps) {
  return (
    <div className={styles.card} style={{ borderLeft: `4px solid ${color}` }}>
      <div className={styles.title}>{title}</div>
      <div className={styles.value} style={{ color }}>{value}</div>
    </div>
  )
}
