import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({
        example: 'abc@gmail.com или +79991234567',
        description: 'Email или номер телефона пользователя'
    })
    @IsString({ message: 'Должно быть строкой' })
    readonly login: string;

    @ApiProperty({
        example: 'qwerty123',
        description: 'Пароль пользователя',
        minLength: 4,
        maxLength: 16
    })
    @IsString({ message: 'Должно быть строкой' })
    @Length(4, 16, { message: 'Не меньше 4 и не больше 16 символов' })
    readonly password: string;
}