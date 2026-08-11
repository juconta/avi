import { ReactNode } from 'react'

interface Props {
  loading?: boolean
  error?: string | null
  children?: ReactNode
  onRetry?: () => void
}

export default function StateHandler({ loading, error, children, onRetry }: Props) {
  if (loading) {
    return <div className="center-box">Cargando…</div>
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
