// products/dto/update-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

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
}