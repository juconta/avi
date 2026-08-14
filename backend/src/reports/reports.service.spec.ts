import { Test } from '@nestjs/testing'
import { Event, EventCategory, EventStatus, VenueKind } from '../storage/entities/event.entity'
import { Payment, PaymentStatus } from '../storage/entities/payment.entity'
import { User } from '../storage/entities/user.entity'
import { ViewStat } from '../storage/entities/view-stat.entity'
import { VodAsset } from '../storage/entities/vod.entity'
import { EVENT_REPO, PAYMENT_REPO, USER_REPO, VIEW_STAT_REPO, VOD_REPO } from '../storage/repositories/tokens'
import { ReportsService } from './reports.service'
import { MockRepo } from '../test/mock-repo'
import { UserRole } from '../common/decorators/roles.decorator'

describe('ReportsService', () => {
  let service: ReportsService
  let eventRepo: MockRepo<Event>
  let paymentRepo: MockRepo<Payment>

  beforeEach(async () => {
    eventRepo = new MockRepo<Event>([
      {
        id: 'evt-1',
        title: 'Concierto',
        description: 'd',
        price: 10,
        coverImage: 'img',
        streamerId: 's1',
        status: EventStatus.ENDED,
        scheduledAt: new Date(),
        durationMinutes: 60,
        category: EventCategory.SHOW,
        sport: 'Concierto',
        venue: { kind: VenueKind.THEATER, name: 'Teatro', cameras: [] },
        createdAt: new Date(),
      },
    ])
    paymentRepo = new MockRepo<Payment>([
      {
        id: 'p1',
        userId: 'u1',
        eventId: 'evt-1',
        amount: 10,
        currency: 'USD',
        status: PaymentStatus.COMPLETED,
        provider: 'mock',
        providerRef: 'r1',
        createdAt: new Date(),
        completedAt: new Date(),
      },
      {
        id: 'p2',
        userId: 'u2',
        eventId: 'evt-1',
        amount: 10,
        currency: 'USD',
        status: PaymentStatus.REFUNDED,
        provider: 'mock',
        providerRef: 'r2',
        createdAt: new Date(),
      },
    ])
    const vodRepo = new MockRepo<VodAsset>([])
    const userRepo = new MockRepo<User>([
      { id: 'u1', email: 'a@b.com', password: 'x', name: 'A', role: UserRole.USER, createdAt: new Date() },
    ])
    const viewStatRepo = new MockRepo<ViewStat>([
      { id: 's1', eventId: 'evt-1', userId: 'u1', minutesWatched: 30, peakViewers: 25, date: new Date() },
      { id: 's2', eventId: 'evt-1', userId: 'u2', minutesWatched: 20, peakViewers: 25, date: new Date() },
    ])

    const module = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: EVENT_REPO, useValue: eventRepo },
        { provide: PAYMENT_REPO, useValue: paymentRepo },
        { provide: VOD_REPO, useValue: vodRepo },
        { provide: VIEW_STAT_REPO, useValue: viewStatRepo },
        { provide: USER_REPO, useValue: userRepo },
      ],
    }).compile()

    service = module.get(ReportsService)
  })

  describe('summary', () => {
    it('debería calcular el resumen de métricas', async () => {
      const summary = await service.summary()

      expect(summary.totalEvents).toBe(1)
      expect(summary.totalRevenue).toBe(10)
      expect(summary.totalPayments).toBe(2)
      expect(summary.totalViewers).toBe(50)
      expect(summary.totalUsers).toBe(1)
    })
  })

  describe('revenueByEvent', () => {
    it('debería agregar ingresos por evento', async () => {
      const rows = await service.revenueByEvent()

      expect(rows).toHaveLength(1)
      expect(rows[0].name).toBe('Concierto')
      expect(rows[0].revenue).toBe(10)
      expect(rows[0].purchases).toBe(1)
    })
  })

  describe('topEvents', () => {
    it('debería ordenar por ingresos', async () => {
      const top = await service.topEvents()
      expect(top[0].revenue).toBe(10)
    })
  })
})
