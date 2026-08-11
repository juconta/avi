import { Module, Provider } from '@nestjs/common'
import {
  CHAT_REPO,
  EVENT_REPO,
  PAYMENT_REPO,
  STREAM_SESSION_REPO,
  USER_REPO,
  VIEW_STAT_REPO,
  VOD_REPO,
} from './repositories/tokens'
import { InMemoryStorage } from './in-memory.storage'

const providers: Provider[] = [
  InMemoryStorage,
  {
    provide: USER_REPO,
    inject: [InMemoryStorage],
    useFactory: (s: InMemoryStorage) => s.users,
  },
  {
    provide: EVENT_REPO,
    inject: [InMemoryStorage],
    useFactory: (s: InMemoryStorage) => s.events,
  },
  {
    provide: PAYMENT_REPO,
    inject: [InMemoryStorage],
    useFactory: (s: InMemoryStorage) => s.payments,
  },
  {
    provide: STREAM_SESSION_REPO,
    inject: [InMemoryStorage],
    useFactory: (s: InMemoryStorage) => s.streamSessions,
  },
  {
    provide: VOD_REPO,
    inject: [InMemoryStorage],
    useFactory: (s: InMemoryStorage) => s.vodAssets,
  },
  {
    provide: VIEW_STAT_REPO,
    inject: [InMemoryStorage],
    useFactory: (s: InMemoryStorage) => s.viewStats,
  },
  {
    provide: CHAT_REPO,
    inject: [InMemoryStorage],
    useFactory: (s: InMemoryStorage) => s.chatMessages,
  },
]

@Module({
  providers,
  exports: [
    USER_REPO,
    EVENT_REPO,
    PAYMENT_REPO,
    STREAM_SESSION_REPO,
    VOD_REPO,
    VIEW_STAT_REPO,
    CHAT_REPO,
  ],
})
export class StorageModule {}
