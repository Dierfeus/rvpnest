import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateOrderDto {
    @ApiProperty({ example: 'Новый адрес', required: false })
    @IsOptional()
    @IsString()
    readonly shipping_address?: string;

    @ApiProperty({ example: 'cash', required: false })
    @IsOptional()
    @IsString()
    readonly payment_method?: string;

    @ApiProperty({ example: 'Новый комментарий', required: false })
    @IsOptional()
    @IsString()
    readonly comment?: string;
}