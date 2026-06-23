import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsArray, IsBoolean } from 'class-validator';

export class UpdateProductDto {
    @ApiProperty({
        example: 'Ноутбук Lenovo GamingPad 16',
        description: 'Название товара',
        required: false
    })
    @IsOptional()
    @IsString()
    readonly name?: string;

    @ApiProperty({
        example: 4,
        description: 'ID категории',
        required: false
    })
    @IsOptional()
    @IsNumber()
    readonly id_category?: number;

    @ApiProperty({
        example: 49990,
        description: 'Цена товара',
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    readonly price?: number;

    @ApiProperty({
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
        required: false
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
        example: true,
        description: 'Активен ли товар',
        required: false
    })
    @IsOptional()
    @IsBoolean()
    readonly is_active?: boolean;
}