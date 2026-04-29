import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddProductCharacteristicDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_product: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  readonly id_characters_value: number;
}