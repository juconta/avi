import type { Event } from '../../../shared/src/types/event'
import type { Payment } from '../../../shared/src/types/payment'
import type { VodAsset } from '../../../shared/src/types/vod'
import api from './api'

export const eventsService = {
  async findAll(): Promise<Event[]> {
    const { data } = await api.get<Event[]>('/events')
    return data
  },

  async findById(id: string): Promise<Event> {
    const { data } = await api.get<Event>(`/events/${id}`)
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
