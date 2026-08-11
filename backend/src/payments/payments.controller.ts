import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles, UserRole } from '../common/decorators/roles.decorator'
import { AuthUser } from '../common/guards/roles.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreatePaymentDto } from './dto/payment.dto'
import { PaymentsService } from './payments.service'

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  findAll(@Query('userId') userId?: string, @CurrentUser() user?: AuthUser) {
    const scope = user?.role === UserRole.ADMIN ? userId : user?.id
    return this.paymentsService.findAll(scope)
  }

  @Get('has-paid')
  @Roles(UserRole.USER, UserRole.ADMIN)
  hasPaid(@Query('eventId') eventId: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.hasPaid(user.id, eventId)
  }

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: AuthUser) {
    return this.paymentsService.create(dto, user.id)
  }

  @Patch(':id/refund')
  @Roles(UserRole.ADMIN)
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id)
  }
}
