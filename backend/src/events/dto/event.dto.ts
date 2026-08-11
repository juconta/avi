import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { EventStatus } from '../../storage/entities/event.entity'

export class CreateEventDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsString()
  coverImage?: string

  @IsDateString()
  scheduledAt: string

  @IsNumber()
  @Min(1)
  durationMinutes: number
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @IsOptional()
  @IsString()
  coverImage?: string

  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @IsOptional()
  @IsString()
  status?: EventStatus

  @IsOptional()
  @IsString()
  liveUrl?: string
}
