import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles, UserRole } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { ReportsService } from './reports.service'

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN)
  summary() {
    return this.reportsService.summary()
  }

  @Get('revenue-by-event')
  @Roles(UserRole.ADMIN)
  revenueByEvent() {
    return this.reportsService.revenueByEvent()
  }

  @Get('top-events')
  @Roles(UserRole.ADMIN)
  topEvents() {
    return this.reportsService.topEvents()
  }
}
