import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { EventsModule } from './events/events.module'
import { PaymentsModule } from './payments/payments.module'
import { ReportsModule } from './reports/reports.module'
import { StorageModule } from './storage/storage.module'
import { StreamingModule } from './streaming/streaming.module'
import { UsersModule } from './users/users.module'
import { VodModule } from './vod/vod.module'

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    StorageModule,
    AuthModule,
    UsersModule,
    EventsModule,
    PaymentsModule,
    StreamingModule,
    VodModule,
    ReportsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
