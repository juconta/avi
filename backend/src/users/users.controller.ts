import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { UsersService } from './users.service'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findById(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.usersService.updateProfile(id, data)
  }
}
