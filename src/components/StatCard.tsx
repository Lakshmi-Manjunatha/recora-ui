import './StatCard.css'

type StatCardProps = {
  label: string
  value: string
  description: string
}

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="stat-card">
      <p className="stat-card-label">{label}</p>
      <h3 className="stat-card-value">{value}</h3>
      <p className="stat-card-description">{description}</p>
    </article>
  )
}

export default StatCard
