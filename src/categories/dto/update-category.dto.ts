import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class UpdateCategoryDto {
    @ApiProperty({
        example: 'Ноутбуки',
        description: 'Новое название категории',
        required: false
    })
    @IsOptional()
    @IsString()
    readonly category?: string;

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
        example: 'https://example.com/images/laptops_new.jpg',
        description: 'Новая ссылка на картинку категории',
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsUrl({}, { message: 'Некорректный URL' })
    readonly image_url?: string | null;

    @ApiProperty({
        example: 'fa-laptop',
        description: 'Новый класс иконки (FontAwesome)',
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsString()
    readonly icon_class?: string | null;

    @ApiProperty({
        example: 'Ноутбуки всех брендов',
        description: 'Новое описание категории',
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsString()
    readonly description?: string | null;
}