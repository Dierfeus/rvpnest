import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateCharacteristicDto {
  @ApiProperty({ example: 'Вес' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'кг' })
  @IsString()
  @Length(1, 50)
  readonly unit: string;
}