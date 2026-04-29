import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, ArrayMinSize, IsArray } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  readonly id_seller: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_buyer: number;

  @ApiProperty({ example: '2025-04-27' })
  @IsDateString()
  readonly date: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  readonly id_discount?: number;

  @ApiProperty({ example: [1, 3, 5] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  readonly productIds: number[];
}