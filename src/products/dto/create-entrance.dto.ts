import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateEntranceDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_product: number;

  @ApiProperty({ example: '2025-01-15T10:00:00Z' })
  @IsDateString()
  readonly date: string;

  @ApiProperty({ example: 450.00 })
  @IsNumber()
  readonly purchase_price: number;

  @ApiProperty({ example: 10, description: 'Количество поступления', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly quantity?: number;
}