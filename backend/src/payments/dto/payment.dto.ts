import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreatePaymentDto {
  @IsString()
  eventId: string

  @IsNumber()
  @Min(0.01)
  amount: number

  @IsOptional()
  @IsString()
  provider?: 'stripe' | 'mock'
}
