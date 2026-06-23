import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCharacteristicValueDto {
  @ApiProperty({
    example: 1,
    description: 'ID характеристики'
  })
  @IsNumber()
  readonly id_characteristic: number;

  @ApiProperty({
    example: '2.5',
    description: 'Значение характеристики'
  })
  @IsString()
  readonly value: string;

  @ApiProperty({
    example: 'Стандартное значение',
    description: 'Дополнительное описание значения',
    required: false
  })
  @IsOptional()
  @IsString()
  readonly description?: string;
}