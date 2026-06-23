import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
    @ApiProperty({ example: 2, description: 'ID нового статуса' })
    @IsNumber()
    readonly id_status: number;

    @ApiProperty({ example: 'Заказ готов к выдаче', required: false })
    @IsOptional()
    @IsString()
    readonly comment?: string;
}