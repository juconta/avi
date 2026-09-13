import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../../../../shared/src/types/event'
import StateHandler from '../../components/StateHandler'
import { eventsService } from '../../services/data.service'
import { formatDateTime } from '../../utils/format'

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setEvents(await eventsService.findAll())
    } catch {
      setError('No se pudieron cargar los eventos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id)
    try {
      await fn()
      await load()
    } catch {
      setError('La acción no se pudo completar.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1 className="page-title">Administración de eventos</h1>
        <Link to="/admin/events/new" className="btn btn-primary">
          Nuevo evento
        </Link>
      </div>

      <StateHandler loading={loading} error={error} onRetry={load}>
        {events.length === 0 ? (
          <p className="muted">No hay eventos.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Deporte</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Cámaras</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.sport ?? '—'}</td>
                  <td>
                    <span className={`badge ${event.status === 'live' ? 'badge-live' : ''}`}>{event.status.toUpperCase()}</span>
                  </td>
                  <td>{formatDateTime(event.scheduledAt)}</td>
                  <td>{event.venue.cameras.length}</td>
                  <td>
                    <div className="admin-actions">
                      {event.status !== 'live' && (
                        <button className="btn btn-primary" disabled={busyId === event.id} onClick={() => void run(event.id, () => eventsService.start(event.id))}>
                          Iniciar
                        </button>
                      )}
                      {event.status === 'live' && (
                        <button className="btn btn-ghost" disabled={busyId === event.id} onClick={() => void run(event.id, () => eventsService.end(event.id))}>
                          Detener
                        </button>
                      )}
                      <Link to={`/admin/events/${event.id}/edit`} className="btn btn-ghost">
                        Editar
                      </Link>
                      {event.status !== 'live' && (
                        <button className="btn btn-danger" disabled={busyId === event.id} onClick={() => void run(event.id, () => eventsService.remove(event.id))}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </StateHandler>
    </div>
  )
}