import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthUser } from '../common/guards/roles.guard'
import { StreamingService } from './streaming.service'

@ApiTags('streaming')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Post('events/:eventId/join')
  join(@Param('eventId') eventId: string, @CurrentUser() user: AuthUser) {
    return this.streamingService.join(eventId, user.id)
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
