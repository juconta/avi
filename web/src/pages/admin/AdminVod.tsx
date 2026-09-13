import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { VodAsset } from '../../../../shared/src/types/vod'
import StateHandler from '../../components/StateHandler'
import { vodService } from '../../services/data.service'
import { formatDuration } from '../../utils/format'

export default function AdminVod() {
  const [vods, setVods] = useState<VodAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setVods(await vodService.findAll())
    } catch {
      setError('No se pudieron cargar los contenidos VOD.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const remove = async (id: string) => {
    try {
      await vodService.remove(id)
      await load()
    } catch {
      setError('No se pudo eliminar el contenido.')
    }
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1 className="page-title">Administración VOD</h1>
        <Link to="/admin/vod/new" className="btn btn-primary">
          Nuevo contenido
        </Link>
      </div>

      <StateHandler loading={loading} error={error} onRetry={load}>
        {vods.length === 0 ? (
          <p className="muted">No hay contenido VOD.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Duración</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vods.map((vod) => (
                <tr key={vod.id}>
                  <td>{vod.title}</td>
                  <td>{formatDuration(vod.durationSeconds)}</td>
                  <td>{vod.price === 0 ? 'Gratis' : `$${vod.price.toFixed(2)}`}</td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/admin/vod/${vod.id}/edit`} className="btn btn-ghost">
                        Editar
                      </Link>
                      <button className="btn btn-danger" onClick={() => void remove(vod.id)}>
                        Eliminar
                      </button>
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