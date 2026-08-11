import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { eventsService, paymentsService } from '../services/data.service'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency, formatDateTime } from '../utils/format'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const eventData = await eventsService.findById(id)
      setEvent(eventData)
      if (user) {
        try {
          setHasPaid(await paymentsService.hasPaid(id))
        } catch {
          setHasPaid(false)
        }
      }
    } catch {
      setError('No se encontró el evento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id, user])

  const buy = async () => {
    if (!event || !user) return
    setPurchasing(true)
    try {
      await paymentsService.create(event.id, event.price)
      setHasPaid(true)
    } catch {
      setError('No se pudo procesar el pago.')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const isLive = event.status === 'live'
  const ended = event.status === 'ended'
  const canWatch = hasPaid || event.price === 0 || user?.role === 'admin'

  return (
    <div className="container detail">
      <div className="detail-hero">
        <img src={event.coverImage} alt={event.title} />
        <div className="detail-overlay">
          <h1>{event.title}</h1>
          <p>{formatDateTime(event.scheduledAt)} · {event.durationMinutes} min</p>
          <div className="price-big">{formatCurrency(event.price)}</div>
        </div>
      </div>

      <div className="detail-actions">
        {ended ? (
          <>
            {canWatch ? (
              <Link to={`/watch/${event.id}`} className="btn btn-primary btn-lg">
                Ver repetición
              </Link>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={buy} disabled={purchasing}>
                {purchasing ? 'Procesando…' : `Comprar por ${formatCurrency(event.price)}`}
              </button>
            )}
          </>
        ) : isLive ? (
          canWatch ? (
            <Link to={`/watch/${event.id}`} className="btn btn-danger btn-lg">
              Ver en vivo
            </Link>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={buy} disabled={purchasing}>
              {purchasing ? 'Procesando…' : `Comprar por ${formatCurrency(event.price)}`}
            </button>
          )
        ) : (
          <>
            {canWatch ? (
              <span className="badge badge-ready">Ya tienes acceso</span>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={buy} disabled={purchasing}>
                {purchasing ? 'Procesando…' : `Comprar por ${formatCurrency(event.price)}`}
              </button>
            )}
          </>
        )}
        {!user && (
          <Link to="/login" className="btn btn-ghost btn-lg">
            Inicia sesión para comprar
          </Link>
        )}
      </div>

      <p className="detail-description">{event.description}</p>

      {hasPaid && <div className="alert alert-success">¡Ya tienes acceso a este evento!</div>}
    </div>
  )
}
