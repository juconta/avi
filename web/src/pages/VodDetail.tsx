import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { VodAsset } from '../../../shared/src/types/vod'
import HlsPlayer from '../components/HlsPlayer'
import StateHandler from '../components/StateHandler'
import { vodService } from '../services/data.service'
import { formatCurrency, formatDuration } from '../utils/format'

export default function VodDetail() {
  const { id } = useParams<{ id: string }>()

  const [vod, setVod] = useState<VodAsset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setVod(await vodService.findById(id))
    } catch {
      setError('No se encontró el contenido.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  if (loading || error || !vod) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  return (
    <div className="container detail">
      <div className="detail-hero">
        <img src={vod.thumbUrl} alt={vod.title} />
        <div className="detail-overlay">
          <h1>{vod.title}</h1>
          <p>{formatDuration(vod.durationSeconds)}</p>
          <div className="price-big price-free">{vod.price === 0 ? 'Gratis' : formatCurrency(vod.price)}</div>
        </div>
      </div>

      <div className="detail-actions">
        <a href="#player" className="btn btn-primary btn-lg">
          Reproducir
        </a>
      </div>

      <p className="detail-description">{vod.description}</p>

      <div id="player">
        <HlsPlayer src={vod.videoUrl} poster={vod.thumbUrl} />
      </div>
    </div>
  )
}
