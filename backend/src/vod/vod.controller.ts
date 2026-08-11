import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles, UserRole } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreateVodDto, UpdateVodDto } from './dto/vod.dto'
import { VodService } from './vod.service'

@ApiTags('vod')
@Controller('vod')
export class VodController {
  constructor(private readonly vodService: VodService) {}

  @Get()
  findAll() {
    return this.vodService.findAll()
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.vodService.findById(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateVodDto) {
    return this.vodService.create(dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateVodDto) {
    return this.vodService.update(id, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.vodService.remove(id)
  }
}
