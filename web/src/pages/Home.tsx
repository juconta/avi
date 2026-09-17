import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import type { VodAsset } from '../../../shared/src/types/vod'
import EventCard from '../components/EventCard'
import StateHandler from '../components/StateHandler'
import { eventsService, vodService } from '../services/data.service'

function formatViewers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

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
  const totalViewers = liveEvents.reduce((sum, e) => sum + (e.viewers ?? 0), 0)

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-brand">
          <img src="/avi-logo-titulo.png" alt="AVI" className="hero-logo" />
          <span className="hero-subtitle">Asiento Virtual Interactivo</span>
        </div>
        <h1>Viví el partido desde tu propia visión</h1>
        <p>
          Elegí entre múltiples cámaras, transmisión 4K y chat en vivo desde cualquier dispositivo.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>{liveEvents.length}</strong>
            <span>en vivo</span>
          </div>
          <div className="hero-stat">
            <strong>{formatViewers(totalViewers)}</strong>
            <span>espectadores</span>
          </div>
          <div className="hero-stat">
            <strong>{events.length}</strong>
            <span>eventos</span>
          </div>
        </div>
        {liveEvents[0] && (
          <Link to={`/watch/${liveEvents[0].id}`} className="btn btn-primary btn-lg hero-cta">
            Ver en vivo ahora
          </Link>
        )}
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

        {upcomingEvents.length > 0 && (
          <section>
            <h2 className="section-title">Próximos eventos</h2>
            <div className="grid">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {vods.length > 0 && (
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
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </StateHandler>
    </div>
  )
}
