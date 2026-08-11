import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateVodDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsNumber()
  @Min(1)
  durationSeconds: number

  @IsString()
  videoUrl: string

  @IsOptional()
  @IsString()
  thumbUrl?: string

  @IsNumber()
  @Min(0)
  price: number
}

export class UpdateVodDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationSeconds?: number

  @IsOptional()
  @IsString()
  videoUrl?: string

  @IsOptional()
  @IsString()
  thumbUrl?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number
}
