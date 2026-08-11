import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Payment, PaymentStatus } from '../storage/entities/payment.entity'
import { PAYMENT_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'
import { CreatePaymentDto } from './dto/payment.dto'

@Injectable()
export class PaymentsService {
  constructor(@Inject(PAYMENT_REPO) private readonly paymentRepo: CrudRepository<Payment>) {}

  async findAll(userId?: string): Promise<Payment[]> {
    const payments = await this.paymentRepo.findAll()
    const sorted = payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return userId ? sorted.filter((p) => p.userId === userId) : sorted
  }

  async create(dto: CreatePaymentDto, userId: string): Promise<Payment> {
    const payment: Payment = {
      id: crypto.randomUUID(),
      userId,
      eventId: dto.eventId,
      amount: dto.amount,
      currency: 'USD',
      status: PaymentStatus.COMPLETED,
      provider: dto.provider ?? 'mock',
      providerRef: `mock_${crypto.randomUUID()}`,
      createdAt: new Date(),
      completedAt: new Date(),
    }
    return this.paymentRepo.create(payment)
  }

  async hasPaid(userId: string, eventId: string): Promise<boolean> {
    const payments = await this.paymentRepo.findAll()
    return payments.some(
      (p) => p.userId === userId && p.eventId === eventId && p.status === PaymentStatus.COMPLETED,
    )
  }

  async refund(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.update(id, {
      status: PaymentStatus.REFUNDED,
    })
    if (!payment) throw new NotFoundException(`Pago ${id} no encontrado`)
    return payment
  }
}
