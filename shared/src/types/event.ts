export enum EventStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export interface Event {
  id: string
  title: string
  description: string
  price: number
  coverImage: string
  streamerId: string
  status: EventStatus
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  durationMinutes: number
  liveUrl?: string
  createdAt: string
}
