import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { CameraPosition, Event } from '../../../shared/src/types/event'
import HlsPlayer from '../components/HlsPlayer'
import StateHandler from '../components/StateHandler'
import { eventsService, streamingService } from '../services/data.service'
import { connectSocket, disconnectSocket, sendChat, ChatMessage } from '../services/socket'
import { useAuth } from '../hooks/useAuth'

const MAX_CAMERAS = 4

const typeColor: Record<string, string> = {
  side: 'var(--primary)',
  goal: 'var(--warning)',
  hoop: 'var(--warning)',
  referee: 'var(--success)',
  track: 'var(--danger)',
  vehicle: 'var(--danger)',
  driver: 'var(--danger)',
  stage: 'var(--primary)',
}

export default function Watch() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [viewers, setViewers] = useState(0)
  const [input, setInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectorOpen, setSelectorOpen] = useState(false)

  const cameras = useMemo<CameraPosition[]>(() => event?.venue.cameras ?? [], [event])

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [eventData, history] = await Promise.all([
        eventsService.findById(id),
        streamingService.history(id),
      ])
      setEvent(eventData)
      setMessages(history)

      if (selectedIds.length === 0 && eventData.venue.cameras.length > 0) {
        setSelectedIds([eventData.venue.cameras[0].id])
      }

      void streamingService.join(id)

      connectSocket(id, {
        onMessage: (msg) => setMessages((prev) => [...prev, msg]),
        onViewers: ({ count }) => setViewers(count),
      })
    } catch {
      setError('No se pudo cargar el streaming.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    return () => disconnectSocket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const selectedCameras = cameras.filter((c) => selectedIds.includes(c.id)).slice(0, MAX_CAMERAS)

  const mainUrl = selectedCameras[0]?.liveUrl ?? event.liveUrl ?? 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  const extraCameras = selectedCameras.slice(1)

  const toggleCamera = (camera: CameraPosition) => {
    setSelectedIds((prev) => {
      if (prev.includes(camera.id)) return prev.filter((oid) => oid !== camera.id)
      if (prev.length >= MAX_CAMERAS) return prev
      return [...prev, camera.id]
    })
  }

  const markerLabel = (camera: CameraPosition) => {
    const parts = camera.label.split(' ').filter((p) => p.length > 2)
    return (parts.slice(0, 2).join(' ') || camera.label.slice(0, 2)).slice(0, 12)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendChat(input)
    setInput('')
  }

  return (
    <div className="watch-page">
      <div className="watch-main">
        <div className="watch-grid">
          <div className="watch-tile watch-tile-main">
            <HlsPlayer src={mainUrl} poster={event.coverImage} />
            <span className="watch-tile-label">{selectedCameras[0]?.label ?? 'Señal principal'}</span>
          </div>
          {extraCameras.map((camera) => (
            <div key={camera.id} className="watch-tile">
              <HlsPlayer src={camera.liveUrl} />
              <span className="watch-tile-label">{camera.label}</span>
            </div>
          ))}
        </div>

        <div className="watch-info">
          <h1>{event.title}</h1>
          <span className="badge badge-live">
            {event.status === 'live' ? 'EN VIVO' : 'GRABADO'} · {viewers} viendo
          </span>
        </div>

        <button className="btn btn-primary" onClick={() => setSelectorOpen(true)}>
          Cámaras ({selectedCameras.length}/{MAX_CAMERAS})
        </button>
      </div>

      <div className="chat-panel">
        <h3>Chat en vivo</h3>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              <strong>{msg.userName}:</strong> {msg.text}
            </div>
          ))}
          {messages.length === 0 && <p className="muted">Aún no hay mensajes.</p>}
        </div>
        <form className="chat-input" onSubmit={submit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? 'Escribe un mensaje…' : 'Inicia sesión para chatear'}
            disabled={!user}
            maxLength={300}
          />
          <button type="submit" className="btn btn-primary" disabled={!user}>
            Enviar
          </button>
        </form>
      </div>

      {selectorOpen && (
        <div className="modal-overlay" onClick={() => setSelectorOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Elige tus cámaras</h2>
              <button className="btn btn-ghost" onClick={() => setSelectorOpen(false)}>
                Listo
              </button>
            </div>
            <p className="muted">
              {event.venue.name} · {event.sport ?? ''} — toca hasta {MAX_CAMERAS} cámaras
            </p>

            <div className={`venue-map venue-map-${event.venue.kind}`}>
              <div className="venue-silhouette">{event.venue.kind === 'track' ? 'CIRCUITO' : event.venue.kind === 'theater' ? 'ESCENARIO' : ''}</div>
              {event.venue.cameras.map((camera) => {
                const isSelected = selectedIds.includes(camera.id)
                return (
                  <button
                    key={camera.id}
                    className={`camera-marker${isSelected ? ' camera-marker-selected' : ''}`}
                    style={{
                      left: `${camera.position.x * 100}%`,
                      top: `${camera.position.y * 100}%`,
                      background: typeColor[camera.type] ?? 'var(--primary)',
                    }}
                    onClick={() => toggleCamera(camera)}
                    title={`${camera.label} — ${camera.description}`}
                  >
                    {markerLabel(camera)}
                  </button>
                )
              })}
            </div>

            <div className="legend">
              {selectedCameras.map((camera) => (
                <div key={camera.id} className="legend-item">
                  <span className="legend-dot" style={{ background: typeColor[camera.type] ?? 'var(--primary)' }} />
                  {camera.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}