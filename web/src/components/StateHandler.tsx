import { ReactNode } from 'react'

interface Props {
  loading?: boolean
  error?: string | null
  children?: ReactNode
  onRetry?: () => void
}

export default function StateHandler({ loading, error, children, onRetry }: Props) {
  if (loading) {
    return (
      <div className="skeleton-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-image" />
            <div className="skeleton skeleton-line wide" />
            <div className="skeleton skeleton-line" />
          </div>
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <div className="center-box error-box">
        <p>{error}</p>
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    )
  }
  return <>{children}</>
}