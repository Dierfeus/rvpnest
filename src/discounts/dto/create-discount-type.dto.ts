import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDiscountTypeDto {
  @ApiProperty({ example: 'Сезонная' })
  @IsString()
  readonly name: string;
}