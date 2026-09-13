import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import EventDetail from './pages/EventDetail'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import VodCatalog from './pages/VodCatalog'
import VodDetail from './pages/VodDetail'
import Watch from './pages/Watch'
import AdminEvents from './pages/admin/AdminEvents'
import EventForm from './pages/admin/EventForm'
import AdminVod from './pages/admin/AdminVod'
import VodForm from './pages/admin/VodForm'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/vod" element={<VodCatalog />} />
          <Route path="/vod/:id" element={<VodDetail />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <AdminRoute>
                <AdminEvents />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <AdminRoute>
                <EventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <AdminRoute>
                <EventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vod"
            element={
              <AdminRoute>
                <AdminVod />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vod/new"
            element={
              <AdminRoute>
                <VodForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vod/:id/edit"
            element={
              <AdminRoute>
                <VodForm />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}
