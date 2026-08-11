export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Payment {
  id: string
  userId: string
  eventId: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: 'stripe' | 'mock'
  providerRef: string
  createdAt: Date
  completedAt?: Date
}
