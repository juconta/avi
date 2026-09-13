import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StateHandler from '../../components/StateHandler'
import { vodService } from '../../services/data.service'

export default function VodForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationSeconds, setDurationSeconds] = useState('3600')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbUrl, setThumbUrl] = useState('')
  const [price, setPrice] = useState('0')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const vod = await vodService.findById(id!)
        setTitle(vod.title)
        setDescription(vod.description)
        setDurationSeconds(String(vod.durationSeconds))
        setVideoUrl(vod.videoUrl)
        setThumbUrl(vod.thumbUrl ?? '')
        setPrice(String(vod.price))
      } catch {
        setError('No se encontró el contenido.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id, isEdit])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !videoUrl.trim() || !durationSeconds) {
      setError('Completá título, URL y duración.')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      title,
      description,
      durationSeconds: Number(durationSeconds) || 1,
      videoUrl,
      thumbUrl: thumbUrl || '',
      price: Number(price) || 0,
    }
    try {
      if (isEdit) await vodService.update(id!, payload)
      else await vodService.create(payload)
      navigate('/admin/vod')
    } catch {
      setError('No se pudo guardar el contenido. Verificá los datos.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <StateHandler loading />
  if (error && isEdit && loading === false && !title) {
    return <StateHandler loading={false} error={error} />
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1 className="page-title">{isEdit ? 'Editar contenido' : 'Nuevo contenido VOD'}</h1>
        <Link to="/admin/vod" className="btn btn-ghost">
          Volver
        </Link>
      </div>

      <form className="card form admin-form" onSubmit={onSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Documental…" required />
        </label>
        <label>
          Descripción
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <div className="form-row">
          <label>
            Duración (segundos)
            <input type="number" min={1} value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} required />
          </label>
          <label>
            Precio
            <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
        </div>
        <label>
          URL del video (.m3u8)
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…/index.m3u8" required />
        </label>
        <label>
          Miniatura (URL opcional)
          <input value={thumbUrl} onChange={(e) => setThumbUrl(e.target.value)} placeholder="https://…" />
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear contenido'}
          </button>
        </div>
      </form>
    </div>
  )
}