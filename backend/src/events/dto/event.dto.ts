import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUrl, Matches, Min, ValidateNested } from 'class-validator'
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

export class SourceDto {
  @IsString()
  label: string

  @IsUrl({ protocols: ['http', 'https'] })
  @Matches(/\.m3u8$/i, { message: 'liveUrl debe terminar en .m3u8' })
  liveUrl: string
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

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  sources?: SourceDto[]
}

export class ValidateSourceDto {
  @IsUrl({ protocols: ['http', 'https'] })
  @Matches(/\.m3u8$/i, { message: 'liveUrl debe terminar en .m3u8' })
  url: string
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

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  sources?: SourceDto[]
}