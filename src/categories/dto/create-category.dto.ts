import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUrl, IsIn } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Ноутбуки',
    description: 'Название категории'
  })
  @IsString()
  readonly category: string;

  @ApiProperty({
    example: null,
    description: 'ID родительской категории (null для корневой)',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsNumber()
  readonly id_parent_category?: number | null;

  @ApiProperty({
    example: 'https://example.com/images/laptops.jpg',
    description: 'Ссылка на картинку категории',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL' })
  readonly image_url?: string | null;

  @ApiProperty({
    example: 'fa-laptop',
    description: 'Класс иконки (FontAwesome)',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString()
  readonly icon_class?: string | null;

  @ApiProperty({
    example: 'Ноутбуки всех брендов',
    description: 'Описание категории',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString()
  readonly description?: string | null;
}