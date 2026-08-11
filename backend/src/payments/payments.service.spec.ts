import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { Payment, PaymentStatus } from '../storage/entities/payment.entity'
import { PAYMENT_REPO } from '../storage/repositories/tokens'
import { PaymentsService } from './payments.service'
import { MockRepo } from '../test/mock-repo'

describe('PaymentsService', () => {
  let service: PaymentsService
  let repo: MockRepo<Payment>

  beforeEach(async () => {
    repo = new MockRepo<Payment>([
      {
        id: 'pay-1',
        userId: 'u1',
        eventId: 'evt-1',
        amount: 9.99,
        currency: 'USD',
        status: PaymentStatus.COMPLETED,
        provider: 'mock',
        providerRef: 'ref-1',
        createdAt: new Date(),
        completedAt: new Date(),
      },
      {
        id: 'pay-2',
        userId: 'u2',
        eventId: 'evt-1',
        amount: 9.99,
        currency: 'USD',
        status: PaymentStatus.PENDING,
        provider: 'mock',
        providerRef: 'ref-2',
        createdAt: new Date(),
      },
    ])

    const module = await Test.createTestingModule({
      providers: [PaymentsService, { provide: PAYMENT_REPO, useValue: repo }],
    }).compile()

    service = module.get(PaymentsService)
  })

  describe('findAll', () => {
    it('debería devolver todos los pagos', async () => {
      const payments = await service.findAll()
      expect(payments).toHaveLength(2)
    })

    it('debería filtrar por usuario', async () => {
      const payments = await service.findAll('u2')
      expect(payments).toHaveLength(1)
      expect(payments[0].id).toBe('pay-2')
    })
  })

  describe('create', () => {
    it('debería crear un pago completado por defecto', async () => {
      const created = await service.create(
        { eventId: 'evt-2', amount: 4.99, provider: 'mock' },
        'u3',
      )

      expect(created.status).toBe(PaymentStatus.COMPLETED)
      expect(created.userId).toBe('u3')
      expect(created.amount).toBe(4.99)
      expect(repo.items).toHaveLength(3)
    })
  })

  describe('hasPaid', () => {
    it('debería devolver true si el pago está completado', async () => {
      expect(await service.hasPaid('u1', 'evt-1')).toBe(true)
    })

    it('debería devolver false si solo hay pagos pendientes', async () => {
      expect(await service.hasPaid('u2', 'evt-1')).toBe(false)
    })

    it('debería devolver false si no hay pagos', async () => {
      expect(await service.hasPaid('u1', 'evt-999')).toBe(false)
    })
  })

  describe('refund', () => {
    it('debería reembolsar un pago existente', async () => {
      const refunded = await service.refund('pay-1')
      expect(refunded.status).toBe(PaymentStatus.REFUNDED)
    })

    it('debería fallar si el pago no existe', async () => {
      await expect(service.refund('nope')).rejects.toThrow('no encontrado')
    })
  })
})
