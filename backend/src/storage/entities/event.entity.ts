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
  scheduledAt: Date
  startedAt?: Date
  endedAt?: Date
  durationMinutes: number
  liveUrl?: string
  createdAt: Date
}
