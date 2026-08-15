import { Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { StreamingService } from './streaming.service'

@ApiTags('streaming')
@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Post('events/:eventId/join')
  join(@Param('eventId') eventId: string) {
    return this.streamingService.join(eventId, 'guest')
  }

  @Get('events/:eventId/chat/history')
  history(@Param('eventId') eventId: string) {
    return this.streamingService.history(eventId)
  }

  @Get('events/:eventId/viewers')
  viewerCount(@Param('eventId') eventId: string) {
    return this.streamingService.viewerCount(eventId)
  }
}
