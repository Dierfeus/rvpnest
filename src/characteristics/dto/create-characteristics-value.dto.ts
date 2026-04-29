import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCharacteristicValueDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly id_characteristic: number;

  @ApiProperty({ example: '2.5' })
  @IsString()
  readonly value: string;
}