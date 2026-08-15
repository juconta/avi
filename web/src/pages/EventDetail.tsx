import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { eventsService } from '../services/data.service'
import { useAuth } from '../hooks/useAuth'
import { formatDateTime } from '../utils/format'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const categoryLabel: Record<string, string> = {
    sport: 'Deporte',
    racing: 'Automovilismo',
    show: 'Espectáculo',
  }

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setEvent(await eventsService.findById(id))
    } catch {
      setError('No se encontró el evento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const isLive = event.status === 'live'
  const ended = event.status === 'ended'

  return (
    <div className="container detail">
      <div className="detail-hero">
        <img src={event.coverImage} alt={event.title} />
        <div className="detail-overlay">
          <h1>{event.title}</h1>
          <p>{formatDateTime(event.scheduledAt)} · {event.durationMinutes} min</p>
          <div className="price-big price-free">Gratis</div>
        </div>
      </div>

      <div className="detail-actions">
        <div className="detail-tags">
          <span className="detail-tag">{categoryLabel[event.category] ?? event.category}</span>
          {event.sport && <span className="detail-tag">{event.sport}</span>}
          {event.venue.cameras.length > 0 && <span className="detail-tag">{event.venue.cameras.length} cámaras</span>}
        </div>
        <Link to={`/watch/${event.id}`} className={`btn ${isLive ? 'btn-danger' : 'btn-primary'} btn-lg`}>
          {isLive ? 'Ver en vivo' : ended ? 'Ver repetición' : 'Ver'}
        </Link>
      </div>

      <p className="detail-description">{event.description}</p>
    </div>
  )
}
