import { useId } from 'react'
import { formatAmount } from '../../types/receipt'

interface SpendingBreakdownProps {
  title: string
  entries: readonly { label: string; amount: number }[]
  emptyMessage: string
}

function SpendingBreakdown({ title, entries, emptyMessage }: SpendingBreakdownProps) {
  const titleId = useId()
  const scale = entries.reduce((largest, { amount }) => Math.max(largest, Math.abs(amount)), 0)

  return (
    <section className="insights-card insights-section" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {entries.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul className="insights-breakdown">
          {entries.map(({ label, amount }) => (
            <li key={label}>
              <span>{label}</span>
              <strong>{formatAmount(amount)}</strong>
              <span className="insights-track" aria-hidden="true">
                <span style={{ width: `${scale === 0 ? 0 : (Math.abs(amount) / scale) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SpendingBreakdown
