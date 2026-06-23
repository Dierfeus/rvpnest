import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateCharacteristicDto {
    @ApiProperty({
        example: 'Вес',
        description: 'Новое название характеристики',
        required: false
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    readonly name?: string;

    @ApiProperty({
        example: 'кг',
        description: 'Новая единица измерения',
        required: false
    })
    @IsOptional()
    @IsString()
    @Length(0, 50)
    readonly unit?: string;

    @ApiProperty({
        example: 'Физические параметры',
        description: 'Новая группа характеристики',
        required: false
    })
    @IsOptional()
    @IsString()
    readonly group?: string;
}