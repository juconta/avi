import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { StorageModule } from '../storage/storage.module'
import { StreamingController } from './streaming.controller'
import { StreamingGateway } from './streaming.gateway'
import { StreamingService } from './streaming.service'

@Module({
  imports: [
    StorageModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'avi_dev_secret_change_in_production',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [StreamingController],
  providers: [StreamingService, StreamingGateway],
  exports: [StreamingService],
})
export class StreamingModule {}
