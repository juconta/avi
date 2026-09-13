import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Event } from '../../../../shared/src/types/event'
import { EventCategory } from '../../../../shared/src/types/event'
import StateHandler from '../../components/StateHandler'
import { eventsService } from '../../services/data.service'

interface SourceRow {
  label: string
  liveUrl: string
  tested?: 'ok' | 'error' | 'testing'
  message?: string
}

const MAX_CAMERAS = 12
const MIN_CAMERAS = 1

export default function EventForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [coverImage, setCoverImage] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('120')
  const [category, setCategory] = useState<EventCategory>(EventCategory.SPORT)
  const [sport, setSport] = useState('')
  const [count, setCount] = useState(4)
  const [sources, setSources] = useState<SourceRow[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const event = await eventsService.findById(id!)
        setTitle(event.title)
        setDescription(event.description)
        setPrice(String(event.price))
        setCoverImage(event.coverImage ?? '')
        setScheduledAt(toLocalInput(event.scheduledAt))
        setDurationMinutes(String(event.durationMinutes))
        setCategory(event.category)
        setSport(event.sport ?? '')
        setCount(event.venue.cameras.length)
        setSources(
          event.venue.cameras.map((c) => ({
            label: c.label,
            liveUrl: c.liveUrl,
          })),
        )
      } catch {
        setError('No se encontró el evento.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id, isEdit])

  const toLocalInput = (value: string | Date) => {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const resizeSources = (next: number) => {
    const clamped = Math.min(MAX_CAMERAS, Math.max(MIN_CAMERAS, next))
    setCount(clamped)
    setSources((prev) => {
      const out = [...prev]
      while (out.length < clamped) out.push({ label: `Cámara ${out.length + 1}`, liveUrl: '' })
      return out.slice(0, clamped)
    })
  }

  const updateSource = (index: number, patch: Partial<SourceRow>) => {
    setSources((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const testSource = async (index: number) => {
    const row = sources[index]
    if (!/^https?:\/\/.+/i.test(row.liveUrl)) return
    updateSource(index, { tested: 'testing', message: undefined })
    try {
      const res = await eventsService.validateSource(row.liveUrl)
      updateSource(index, res.ok ? { tested: 'ok', message: res.message } : { tested: 'error', message: res.message })
    } catch {
      updateSource(index, { tested: 'error', message: 'Fallo al validar. Revisá la URL o el CORS.' })
    }
  }

  const testAll = async () => {
    for (let i = 0; i < sources.length; i++) {
      if (sources[i].liveUrl) await testSource(i)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !scheduledAt) {
      setError('Completá título, descripción y fecha.')
      return
    }
    if (sources.length < MIN_CAMERAS || sources.some((s) => !s.liveUrl.trim())) {
      setError(`Cada evento necesita entre ${MIN_CAMERAS} y ${MAX_CAMERAS} fuentes con URL.`)
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      title,
      description,
      price: Number(price) || 0,
      coverImage: coverImage || undefined,
      scheduledAt,
      durationMinutes: Number(durationMinutes) || 60,
      category,
      sport,
      sources: sources.map((s) => ({ label: s.label, liveUrl: s.liveUrl })),
    }
    try {
      if (isEdit) await eventsService.update(id!, payload)
      else await eventsService.create(payload)
      navigate('/admin/events')
    } catch {
      setError('No se pudo guardar el evento. Verificá los datos.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <StateHandler loading />
  if (error && isEdit && loading === false && !sources.length) {
    return <StateHandler loading={false} error={error} />
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1 className="page-title">{isEdit ? 'Editar evento' : 'Nuevo evento'}</h1>
        <Link to="/admin/events" className="btn btn-ghost">
          Volver
        </Link>
      </div>

      <form className="card form admin-form" onSubmit={onSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <h2>Datos del evento</h2>
        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Final del Campeonato" required />
        </label>
        <label>
          Descripción
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Transmisión multi-cámara…" rows={3} required />
        </label>
        <div className="form-row">
          <label>
            Categoría
            <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
              <option value="sport">Deporte</option>
              <option value="racing">Automovilismo</option>
              <option value="show">Espectáculo</option>
            </select>
          </label>
          <label>
            Deporte / evento
            <input value={sport} onChange={(e) => setSport(e.target.value)} placeholder="Fútbol, F1, Concierto…" />
          </label>
        </div>
        <div className="form-row">
          <label>
            Fecha y hora
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
          </label>
          <label>
            Duración (min)
            <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Precio
            <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label>
            Portada (URL opcional)
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" />
          </label>
        </div>

        <h2>Fuentes de transmisión</h2>
        <p className="muted">En este evento se podrán ver hasta 12 fuentes; el espectador elige 4 a la vez.</p>
        <label>
          Nº de cámaras ({sources.length || MIN_CAMERAS}/{MAX_CAMERAS})
          <input type="range" min={MIN_CAMERAS} max={MAX_CAMERAS} value={count} onChange={(e) => resizeSources(Number(e.target.value))} />
        </label>

        <div className="admin-sources">
          {sources.map((src, index) => (
            <div key={index} className="source-row">
              <input
                className="source-label"
                value={src.label}
                onChange={(e) => updateSource(index, { label: e.target.value })}
                placeholder={`Cámara ${index + 1}`}
              />
              <input
                className="source-url"
                value={src.liveUrl}
                onChange={(e) => updateSource(index, { liveUrl: e.target.value, tested: undefined })}
                placeholder="https://…/index.m3u8"
              />
              <button type="button" className="btn btn-ghost" disabled={src.tested === 'testing'} onClick={() => void testSource(index)}>
                {src.tested === 'testing' ? '…' : 'Probar'}
              </button>
              {src.tested && (
                <span className={`source-status source-status-${src.tested}`} title={src.message}>
                  {src.tested === 'ok' ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="admin-form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => void testAll()}>
            Probar todas las fuentes
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </div>
      </form>
    </div>
  )
}