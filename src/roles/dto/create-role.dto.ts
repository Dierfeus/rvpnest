import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        example: 'admin',
        description: 'Значение роли (уникальное)',
        minLength: 2,
        maxLength: 50
    })
    @IsString({ message: 'Должно быть строкой' })
    @IsNotEmpty({ message: 'Значение роли обязательно' })
    @Length(2, 50, { message: 'Значение роли должно быть от 2 до 50 символов' })
    readonly value: string;

    @ApiProperty({
        example: 'Администратор системы',
        description: 'Описание роли',
        required: false,
        maxLength: 255
    })
    @IsString({ message: 'Должно быть строкой' })
    @Length(0, 255, { message: 'Описание не должно превышать 255 символов' })
    readonly description: string;
}