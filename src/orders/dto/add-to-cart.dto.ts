import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_user: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  readonly id_product: number;
}