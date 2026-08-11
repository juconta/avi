export interface StreamSession {
  id: string
  userId: string
  eventId: string
  token: string
  status: 'active' | 'ended'
  joinedAt: Date
  leftAt?: Date
  viewerCount: number
}

export interface ChatMessage {
  id: string
  eventId: string
  userId: string
  userName: string
  text: string
  sentAt: Date
}
