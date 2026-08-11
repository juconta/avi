import { Inject, Injectable } from '@nestjs/common'
import { Event, EventStatus } from '../storage/entities/event.entity'
import { Payment, PaymentStatus } from '../storage/entities/payment.entity'
import { User } from '../storage/entities/user.entity'
import { VodAsset } from '../storage/entities/vod.entity'
import { ViewStat } from '../storage/entities/view-stat.entity'
import { EVENT_REPO, PAYMENT_REPO, USER_REPO, VIEW_STAT_REPO, VOD_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'

export interface ReportSummary {
  totalUsers: number
  totalEvents: number
  liveEvents: number
  totalPayments: number
  totalRevenue: number
  totalVodAssets: number
  totalViewers: number
}

export interface ReportItem {
  id: string
  name: string
  revenue: number
  purchases: number
  viewers: number
}

@Injectable()
export class ReportsService {
  constructor(
    @Inject(EVENT_REPO) private readonly eventRepo: CrudRepository<Event>,
    @Inject(PAYMENT_REPO) private readonly paymentRepo: CrudRepository<Payment>,
    @Inject(VOD_REPO) private readonly vodRepo: CrudRepository<VodAsset>,
    @Inject(VIEW_STAT_REPO) private readonly viewStatRepo: CrudRepository<ViewStat>,
    @Inject(USER_REPO) private readonly userRepo: CrudRepository<User>,
  ) {}

  async summary(): Promise<ReportSummary> {
    const [events, payments, vods, stats, users] = await Promise.all([
      this.eventRepo.findAll(),
      this.paymentRepo.findAll(),
      this.vodRepo.findAll(),
      this.viewStatRepo.findAll(),
      this.userRepo.findAll(),
    ])

    const completed = payments.filter((p) => p.status === PaymentStatus.COMPLETED)

    return {
      totalUsers: users.length,
      totalEvents: events.length,
      liveEvents: events.filter((e) => e.status === EventStatus.LIVE).length,
      totalPayments: payments.length,
      totalRevenue: completed.reduce((sum, p) => sum + p.amount, 0),
      totalVodAssets: vods.length,
      totalViewers: stats.reduce((sum, s) => sum + s.peakViewers, 0),
    }
  }

  async revenueByEvent(): Promise<ReportItem[]> {
    const [events, payments] = await Promise.all([
      this.eventRepo.findAll(),
      this.paymentRepo.findAll(),
    ])
    const completed = payments.filter((p) => p.status === PaymentStatus.COMPLETED)

    return events.map((event) => {
      const eventPayments = completed.filter((p) => p.eventId === event.id)
      return {
        id: event.id,
        name: event.title,
        revenue: eventPayments.reduce((sum, p) => sum + p.amount, 0),
        purchases: eventPayments.length,
        viewers: eventPayments.length * 3 + 5,
      }
    })
  }

  async topEvents(limit = 5): Promise<ReportItem[]> {
    const byEvent = await this.revenueByEvent()
    return byEvent.sort((a, b) => b.revenue - a.revenue).slice(0, limit)
  }
}
