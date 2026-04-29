import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_discountsType: number;

  @ApiProperty({ example: 'Новогодняя распродажа' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  readonly size: number;

  @ApiProperty({ example: '2025-12-01T00:00:00Z' })
  @IsDateString()
  readonly start_time: string;

  @ApiProperty({ example: '2026-01-15T23:59:59Z' })
  @IsDateString()
  readonly end_time: string;
}