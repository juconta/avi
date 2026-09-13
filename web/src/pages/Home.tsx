import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import type { VodAsset } from '../../../shared/src/types/vod'
import EventCard from '../components/EventCard'
import StateHandler from '../components/StateHandler'
import { eventsService, vodService } from '../services/data.service'

const isLive = (e: Event) => e.status === 'live'
const isUpcoming = (e: Event) => e.status === 'scheduled'

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [vods, setVods] = useState<VodAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [eventsData, vodsData] = await Promise.all([
        eventsService.findAll(),
        vodService.findAll(),
      ])
      setEvents(eventsData)
      setVods(vodsData)
    } catch {
      setError('No se pudieron cargar los eventos. Verifica que el backend esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const liveEvents = events.filter(isLive)
  const upcomingEvents = events.filter(isUpcoming)

  return (
    <div className="container">
      <section className="hero">
        <h1>Vive el evento desde tu asiento</h1>
        <p>Streaming en vivo y contenido bajo demanda con la mejor calidad.</p>
      </section>

      <StateHandler loading={loading} error={error} onRetry={load}>
        {liveEvents.length > 0 && (
          <section>
            <h2 className="section-title">Ahora en vivo</h2>
            <div className="grid">
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="section-title">Próximos eventos</h2>
          {upcomingEvents.length === 0 ? (
            <p className="muted">No hay eventos próximos por ahora.</p>
          ) : (
            <div className="grid">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title">Disponibles en el catálogo</h2>
          <div className="grid">
            {vods.slice(0, 4).map((vod) => (
              <Link key={vod.id} to={`/vod/${vod.id}`} className="event-card">
                <div className="event-card-image">
                  <img src={vod.thumbUrl} alt={vod.title} loading="lazy" />
                </div>
                <div className="event-card-body">
                  <h3>{vod.title}</h3>
                  <p className="muted">{vod.description.slice(0, 60)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </StateHandler>
    </div>
  )
}
