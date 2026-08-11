import { Link } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import { formatDateTime, formatCurrency } from '../utils/format'

export default function EventCard({ event }: { event: Event }) {
  const isLive = event.status === 'live'

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="event-card-image">
        <img src={event.coverImage} alt={event.title} loading="lazy" />
        {isLive && <span className="badge badge-live">EN VIVO</span>}
        {event.price === 0 && <span className="badge badge-free">GRATIS</span>}
      </div>
      <div className="event-card-body">
        <h3>{event.title}</h3>
        <p className="muted">{formatDateTime(event.scheduledAt)}</p>
        <div className="event-card-footer">
          <span className="price">{formatCurrency(event.price)}</span>
          <span className="muted">{event.durationMinutes} min</span>
        </div>
      </div>
    </Link>
  )
}
