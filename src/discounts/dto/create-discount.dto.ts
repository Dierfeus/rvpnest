import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean, IsEnum, Min, IsArray } from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({ example: 1, description: 'ID типа скидки' })
  @IsNumber()
  readonly id_discountsType: number;

  @ApiProperty({ example: 'Новогодняя распродажа' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'NEWYEAR2025', required: false })
  @IsOptional()
  @IsString()
  readonly code?: string;

  @ApiProperty({ example: 'percentage', enum: ['percentage', 'fixed'] })
  @IsEnum(['percentage', 'fixed'])
  readonly type: 'percentage' | 'fixed';

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  @Min(0)
  readonly size: number;

  @ApiProperty({ example: '2025-12-01T00:00:00Z' })
  @IsDateString()
  readonly start_time: string;

  @ApiProperty({ example: '2026-01-15T23:59:59Z' })
  @IsDateString()
  readonly end_time: string;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly min_order_amount?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly max_discount_amount?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly usage_limit?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  readonly is_active?: boolean;

  @ApiProperty({ example: [1, 2, 3], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly productIds?: number[];
}