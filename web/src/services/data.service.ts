import type { Event, EventCategory } from '../../../shared/src/types/event'
import type { Payment } from '../../../shared/src/types/payment'
import type { VodAsset } from '../../../shared/src/types/vod'
import api from './api'

export interface EventPayload {
  title: string
  description: string
  price: number
  coverImage?: string
  scheduledAt: string
  durationMinutes: number
  category?: EventCategory
  sport?: string
  sources?: { label: string; liveUrl: string }[]
}

export const eventsService = {
  async findAll(): Promise<Event[]> {
    const { data } = await api.get<Event[]>('/events')
    return data
  },

  async findUpcoming(): Promise<Event[]> {
    const { data } = await api.get<Event[]>('/events/upcoming')
    return data
  },

  async findById(id: string): Promise<Event> {
    const { data } = await api.get<Event>(`/events/${id}`)
    return data
  },

  async create(event: EventPayload): Promise<Event> {
    const { data } = await api.post<Event>('/events', event)
    return data
  },

  async update(id: string, event: Partial<EventPayload>): Promise<Event> {
    const { data } = await api.patch<Event>(`/events/${id}`, event)
    return data
  },

  async start(id: string): Promise<Event> {
    const { data } = await api.patch<Event>(`/events/${id}/start`)
    return data
  },

  async end(id: string): Promise<Event> {
    const { data } = await api.patch<Event>(`/events/${id}/end`)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/events/${id}`)
  },

  async validateSource(url: string): Promise<{ ok: boolean; status?: number; contentType?: string; cors: boolean; message: string }> {
    const { data } = await api.post('/events/validate-source', { url })
    return data
  },
}

export const paymentsService = {
  async create(eventId: string, amount: number): Promise<Payment> {
    const { data } = await api.post<Payment>('/payments', { eventId, amount, provider: 'mock' })
    return data
  },

  async hasPaid(eventId: string): Promise<boolean> {
    const { data } = await api.get<boolean>('/payments/has-paid', { params: { eventId } })
    return data
  },

  async findAll(): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>('/payments')
    return data
  },
}

export const vodService = {
  async findAll(): Promise<VodAsset[]> {
    const { data } = await api.get<VodAsset[]>('/vod')
    return data
  },

  async findById(id: string): Promise<VodAsset> {
    const { data } = await api.get<VodAsset>(`/vod/${id}`)
    return data
  },

  async create(vod: Omit<VodAsset, 'id' | 'createdAt'>): Promise<VodAsset> {
    const { data } = await api.post<VodAsset>('/vod', vod)
    return data
  },

  async update(id: string, vod: Partial<Omit<VodAsset, 'id' | 'createdAt'>>): Promise<VodAsset> {
    const { data } = await api.patch<VodAsset>(`/vod/${id}`, vod)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/vod/${id}`)
  },
}

export const streamingService = {
  async join(eventId: string) {
    const { data } = await api.post(`/streaming/events/${eventId}/join`)
    return data
  },

  async history(eventId: string) {
    const { data } = await api.get(`/streaming/events/${eventId}/chat/history`)
    return data
  },
}

export const reportsService = {
  async summary() {
    const { data } = await api.get('/reports/summary')
    return data
  },

  async revenueByEvent() {
    const { data } = await api.get('/reports/revenue-by-event')
    return data
  },

  async topEvents() {
    const { data } = await api.get('/reports/top-events')
    return data
  },
}
