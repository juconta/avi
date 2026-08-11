import { useEffect, useState } from 'react'
import StateHandler from '../components/StateHandler'
import { reportsService } from '../services/data.service'

interface Summary {
  totalUsers: number
  totalEvents: number
  liveEvents: number
  totalPayments: number
  totalRevenue: number
  totalVodAssets: number
  totalViewers: number
}

interface ReportItem {
  id: string
  name: string
  revenue: number
  purchases: number
  viewers: number
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [top, setTop] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryData, topData] = await Promise.all([
        reportsService.summary(),
        reportsService.topEvents(),
      ])
      setSummary(summaryData)
      setTop(topData)
    } catch {
      setError('No se pudieron cargar los reportes. Requiere permisos de admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="container">
      <h1 className="page-title">Dashboard</h1>
      <StateHandler loading={loading} error={error} onRetry={load}>
        {summary && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Ingresos</span>
              <span className="stat-value">${summary.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Pagos</span>
              <span className="stat-value">{summary.totalPayments}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Eventos</span>
              <span className="stat-value">{summary.totalEvents}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">En vivo</span>
              <span className="stat-value">{summary.liveEvents}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Contenido VOD</span>
              <span className="stat-value">{summary.totalVodAssets}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Espectadores</span>
              <span className="stat-value">{summary.totalViewers}</span>
            </div>
          </div>
        )}

        <section>
          <h2 className="section-title">Eventos con más ingresos</h2>
          {top.length === 0 ? (
            <p className="muted">Aún no hay datos.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Compras</th>
                  <th>Espectadores</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {top.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.purchases}</td>
                    <td>{item.viewers}</td>
                    <td>${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </StateHandler>
    </div>
  )
}
