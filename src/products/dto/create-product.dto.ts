import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Ноутбук Lenovo GamingPad 16' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_category: number;

  @ApiProperty({ example: 49990 })
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;
}