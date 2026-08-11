import { useEffect, useState } from 'react'
import type { Payment } from '../../../shared/src/types/payment'
import StateHandler from '../components/StateHandler'
import { paymentsService } from '../services/data.service'
import { formatCurrency, formatDateTime } from '../utils/format'

export default function Checkout() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setPayments(await paymentsService.findAll())
    } catch {
      setError('No se pudieron cargar tus compras.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="container">
      <h1 className="page-title">Mis compras</h1>
      <StateHandler loading={loading} error={error} onRetry={load}>
        {payments.length === 0 ? (
          <p className="muted">Aún no tienes compras.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.eventId}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>
                    <span className={`badge badge-${payment.status}`}>{payment.status}</span>
                  </td>
                  <td>{formatDateTime(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </StateHandler>
    </div>
  )
}
