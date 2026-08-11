import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles, UserRole } from '../common/decorators/roles.decorator'
import { AuthUser } from '../common/guards/roles.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { EventStatus } from '../storage/entities/event.entity'
import { CreateEventDto, UpdateEventDto } from './dto/event.dto'
import { EventsService } from './events.service'

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query('status') status?: EventStatus) {
    return this.eventsService.findAll(status)
  }

  @Get('upcoming')
  findUpcoming() {
    return this.eventsService.findUpcoming()
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.eventsService.findById(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STREAMER)
  create(@Body() dto: CreateEventDto, @CurrentUser() user: AuthUser) {
    return this.eventsService.create(dto, user.id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STREAMER)
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/start')
  @Roles(UserRole.ADMIN, UserRole.STREAMER)
  start(@Param('id') id: string) {
    return this.eventsService.start(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/end')
  @Roles(UserRole.ADMIN, UserRole.STREAMER)
  end(@Param('id') id: string) {
    return this.eventsService.end(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id)
  }
}
