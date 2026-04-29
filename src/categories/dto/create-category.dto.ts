import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Электроника' })
  @IsString()
  readonly category: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  readonly id_parent_category?: number;
}