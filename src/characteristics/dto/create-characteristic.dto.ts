import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

export class CreateCharacteristicDto {
  @ApiProperty({
    example: 'Вес',
    description: 'Название характеристики'
  })
  @IsString()
  @Length(1, 100)
  readonly name: string;

  @ApiProperty({
    example: 'кг',
    description: 'Единица измерения',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  readonly unit?: string;

  @ApiProperty({
    example: 'Физические параметры',
    description: 'Группа характеристики',
    required: false
  })
  @IsOptional()
  @IsString()
  readonly group?: string;
}