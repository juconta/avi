import { useEffect, useState } from 'react'
import type { VodAsset } from '../../../shared/src/types/vod'
import StateHandler from '../components/StateHandler'
import { vodService } from '../services/data.service'
import { formatCurrency, formatDuration } from '../utils/format'

export default function VodCatalog() {
  const [vods, setVods] = useState<VodAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setVods(await vodService.findAll())
    } catch {
      setError('No se pudo cargar el catálogo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="container">
      <h1 className="page-title">Catálogo VOD</h1>
      <StateHandler loading={loading} error={error} onRetry={load}>
        {vods.length === 0 ? (
          <p className="muted">No hay contenido disponible.</p>
        ) : (
          <div className="grid">
            {vods.map((vod) => (
              <a key={vod.id} href={`/vod/${vod.id}`} className="event-card">
                <div className="event-card-image">
                  <img src={vod.thumbUrl} alt={vod.title} loading="lazy" />
                  {vod.price === 0 && <span className="badge badge-free">GRATIS</span>}
                </div>
                <div className="event-card-body">
                  <h3>{vod.title}</h3>
                  <p className="muted">{formatDuration(vod.durationSeconds)}</p>
                  <div className="event-card-footer">
                    <span className="price">{formatCurrency(vod.price)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </StateHandler>
    </div>
  )
}
