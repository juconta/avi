import { Module } from '@nestjs/common'
import { StorageModule } from '../storage/storage.module'
import { VodController } from './vod.controller'
import { VodService } from './vod.service'

@Module({
  imports: [StorageModule],
  controllers: [VodController],
  providers: [VodService],
  exports: [VodService],
})
export class VodModule {}
