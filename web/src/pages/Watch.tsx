import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Event } from '../../../shared/src/types/event'
import HlsPlayer from '../components/HlsPlayer'
import StateHandler from '../components/StateHandler'
import { eventsService, streamingService } from '../services/data.service'
import { connectSocket, disconnectSocket, sendChat, ChatMessage } from '../services/socket'
import { useAuth } from '../hooks/useAuth'

export default function Watch() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [viewers, setViewers] = useState(0)
  const [input, setInput] = useState('')

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
  }, [id])

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const liveUrl = event.liveUrl ?? 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendChat(input)
    setInput('')
  }

  return (
    <div className="watch-page">
      <div className="watch-main">
        <HlsPlayer src={liveUrl} poster={event.coverImage} />
        <div className="watch-info">
          <h1>{event.title}</h1>
          <span className="badge badge-live">
            {event.status === 'live' ? 'EN VIVO' : 'GRABADO'} · {viewers} viendo
          </span>
        </div>
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
    </div>
  )
}
