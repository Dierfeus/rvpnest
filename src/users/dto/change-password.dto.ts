import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'oldPassword123',
        description: 'Текущий пароль'
    })
    @IsString({ message: 'Должно быть строкой' })
    @MinLength(4, { message: 'Пароль должен содержать минимум 4 символа' })
    readonly oldPassword: string;

    @ApiProperty({
        example: 'newPassword456',
        description: 'Новый пароль'
    })
    @IsString({ message: 'Должно быть строкой' })
    @Length(4, 16, { message: 'Пароль должен содержать от 4 до 16 символов' })
    readonly newPassword: string;
}