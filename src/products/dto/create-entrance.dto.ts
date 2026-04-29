import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEntranceDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_product: number;

  @ApiProperty({ example: '2025-01-15T10:00:00Z' })
  @IsDateString()
  readonly date: string;  // оставляем string для валидации

  @ApiProperty({ example: 450.00 })
  @IsNumber()
  readonly purchase_price: number;
}