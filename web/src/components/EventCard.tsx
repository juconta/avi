import { Link } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import { formatDateTime, formatCurrency } from '../utils/format'

const categoryLabel: Record<string, string> = {
  sport: 'Deporte',
  racing: 'Automovilismo',
  show: 'Espectáculo',
}

function formatViewers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

export default function EventCard({ event }: { event: Event }) {
  const isLive = event.status === 'live'

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="event-card-image">
        <img src={event.coverImage} alt={event.title} loading="lazy" />
        {isLive && <span className="badge badge-live">EN VIVO</span>}
        {isLive && event.viewers != null && event.viewers > 0 && (
          <span className="badge badge-viewers">👁 {formatViewers(event.viewers)}</span>
        )}
      </div>
      <div className="event-card-body">
        <h3>{event.title}</h3>
      </div>
    </Link>
  )
}
