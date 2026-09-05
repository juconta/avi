import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { jwtSecret } from '../common/env'
import { StorageModule } from '../storage/storage.module'
import { StreamingController } from './streaming.controller'
import { StreamingGateway } from './streaming.gateway'
import { StreamingService } from './streaming.service'

@Module({
  imports: [
    StorageModule,
    JwtModule.register({
      secret: jwtSecret(),
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [StreamingController],
  providers: [StreamingService, StreamingGateway],
  exports: [StreamingService],
})
export class StreamingModule {}
