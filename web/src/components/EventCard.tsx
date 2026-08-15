import { Link } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import { formatDateTime, formatCurrency } from '../utils/format'

const categoryLabel: Record<string, string> = {
  sport: 'Deporte',
  racing: 'Automovilismo',
  show: 'Espectáculo',
}

export default function EventCard({ event }: { event: Event }) {
  const isLive = event.status === 'live'

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="event-card-image">
        <img src={event.coverImage} alt={event.title} loading="lazy" />
        {isLive && <span className="badge badge-live">EN VIVO</span>}
        {event.price === 0 && <span className="badge badge-free">GRATIS</span>}
        <span className="badge badge-category">{categoryLabel[event.category] ?? event.category}</span>
      </div>
      <div className="event-card-body">
        <h3>{event.title}</h3>
        <p className="muted">{formatDateTime(event.scheduledAt)}</p>
        <div className="event-card-footer">
          <span className={event.price === 0 ? 'price price-free' : 'price'}>{event.price === 0 ? 'Gratis' : formatCurrency(event.price)}</span>
          <span className="muted">{event.durationMinutes} min</span>
        </div>
      </div>
    </Link>
  )
}
