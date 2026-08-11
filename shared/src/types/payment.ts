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
  provider: string
  providerRef: string
  createdAt: string
  completedAt?: string
}
