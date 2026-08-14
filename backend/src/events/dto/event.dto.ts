import { IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { EventCategory, EventStatus } from '../../storage/entities/event.entity'

class CameraPositionDto {
  @IsString()
  id: string

  @IsString()
  label: string

  @IsString()
  description: string

  @IsString()
  type: string

  @IsObject()
  position: { x: number; y: number }

  @IsString()
  liveUrl: string
}

class VenueDto {
  @IsString()
  kind: string

  @IsString()
  name: string

  @ValidateNested({ each: true })
  @Type(() => CameraPositionDto)
  cameras: CameraPositionDto[]
}

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

  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory

  @IsOptional()
  @IsString()
  sport?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => VenueDto)
  venue?: VenueDto
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

  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory

  @IsOptional()
  @IsString()
  sport?: string
}