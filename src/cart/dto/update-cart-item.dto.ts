import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
    @ApiProperty({ example: 2, description: 'Новое количество' })
    @IsNumber()
    @Min(1)
    readonly quantity: number;
}