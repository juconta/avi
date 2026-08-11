import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="center-box">
      <h1>404</h1>
      <p className="muted">La página que buscas no existe.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}
