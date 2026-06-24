import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({ example: 5, description: 'ID товара' })
    @IsNumber()
    @Min(1)
    readonly id_product: number;

    @ApiProperty({ example: 2, description: 'Количество', required: false })
    @IsNumber()
    @Min(1)
    readonly quantity?: number;
}