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

  const mainUrl = selectedCameras[0]?.liveUrl ?? event.liveUrl ?? 'https://avi-zaus.onrender.com/hls/football_a/index.m3u8'
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
        <div className="watch-header">
          <h1>{event.title}</h1>
          {event.status === 'live' && (
            <div className="watch-live-row">
              <span className="badge badge-live">EN VIVO</span>
              <span className="muted">{event.sport ?? ''} • {viewers.toLocaleString()} espectadores</span>
            </div>
          )}
        </div>

        <p className="watch-instruction">Selecciona una cámara para tu vista virtual</p>

        <div className="camera-grid">
          {cameras.map((camera) => {
            const isSelected = selectedIds.includes(camera.id)
            return (
              <div
                key={camera.id}
                className={`camera-card${isSelected ? ' camera-card-selected' : ''}`}
                onClick={() => toggleCamera(camera)}
              >
                <div className="camera-card-image">
                  <img src={event.coverImage} alt={camera.label} loading="lazy" />
                  <span className="badge badge-live">EN VIVO</span>
                  <span className="badge badge-4k">4K</span>
                </div>
                <div className="camera-card-body">
                  <h3>{camera.label}</h3>
                  <p className="muted">{camera.description}</p>
                </div>
                {isSelected && (
                  <button className="btn btn-primary btn-sm camera-cta">
                    Ver con {camera.label} — Entrar ahora
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="watch-audio-info">
          Audio disponible: Relato • Estadio • Sin comentarios
        </div>

        {selectedCameras.length > 0 && (
          <div className="watch-player-section">
            <div className="watch-tile watch-tile-main">
              <HlsPlayer src={selectedCameras[0].liveUrl} poster={event.coverImage} />
              <span className="watch-tile-label">{selectedCameras[0].label}</span>
            </div>
          </div>
        )}

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
      </div>
    </div>
  )
}