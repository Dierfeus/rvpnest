import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsArray, IsBoolean, IsPositive } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Ноутбук Lenovo GamingPad 16',
    description: 'Название товара'
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 4,
    description: 'ID категории'
  })
  @IsNumber()
  @IsPositive()
  readonly id_category: number;

  @ApiProperty({
    example: 49990,
    description: 'Цена товара'
  })
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiProperty({
    example: 'Мощный игровой ноутбук с 16" экраном',
    description: 'Описание товара',
    required: false
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'Массив ссылок на изображения',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly images?: string[];

  @ApiProperty({
    example: 'Отличное',
    description: 'Состояние товара',
    required: false,
    enum: ['Отличное', 'Хорошее', 'Рабочее', 'На запчасти']
  })
  @IsOptional()
  @IsString()
  readonly condition?: string;

  @ApiProperty({
    example: 10,
    description: 'Количество на складе',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly stock?: number;

  @ApiProperty({
    example: 1,
    description: 'ID пользователя-продавца'
  })
  @IsNumber()
  @IsPositive()
  readonly id_user: number;
}