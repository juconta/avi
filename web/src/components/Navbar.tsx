import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎥 AVI
      </Link>
      <div className="navbar-links">
        <Link to="/">Inicio</Link>
        <Link to="/vod">Catálogo</Link>
        {user?.role === 'admin' && <Link to="/dashboard">Dashboard</Link>}
        {user ? (
          <div className="navbar-user">
            <span>{user.name}</span>
            <button onClick={logout} className="btn btn-ghost">
              Salir
            </button>
          </div>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register" className="btn btn-primary">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
