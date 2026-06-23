import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCharacteristicValueDto {
    @ApiProperty({
        example: '2.5',
        description: 'Новое значение характеристики',
        required: false
    })
    @IsOptional()
    @IsString()
    readonly value?: string;

    @ApiProperty({
        example: 'Стандартное значение',
        description: 'Новое описание значения',
        required: false
    })
    @IsOptional()
    @IsString()
    readonly description?: string;
}