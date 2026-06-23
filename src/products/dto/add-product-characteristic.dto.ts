// products/dto/add-product-characteristic.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ArrayMinSize } from 'class-validator';

export class AddProductCharacteristicDto {
  @ApiProperty({
    example: 1,
    description: 'ID товара'
  })
  @IsNumber()
  readonly id_product: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Массив ID значений характеристик'
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  readonly characteristicValueIds: number[];
}