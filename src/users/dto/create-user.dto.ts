import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsPhoneNumber, Matches } from 'class-validator';

export class CreateUserDTO {
    @ApiProperty({
        example: 'Иван',
        description: 'Имя пользователя',
        minLength: 2,
        maxLength: 50
    })
    @IsString({ message: 'Должно быть строкой' })
    @Length(2, 50, { message: 'Имя должно содержать от 2 до 50 символов' })
    readonly firstName: string;

    @ApiProperty({
        example: 'Петров',
        description: 'Фамилия пользователя',
        minLength: 2,
        maxLength: 50
    })
    @IsString({ message: 'Должно быть строкой' })
    @Length(2, 50, { message: 'Фамилия должна содержать от 2 до 50 символов' })
    readonly lastName: string;

    @ApiProperty({
        example: '+79991234567',
        description: 'Номер телефона в международном формате',
        pattern: '^\\+?[1-9]\\d{1,14}$'
    })
    @IsString({ message: 'Должно быть строкой' })
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Номер телефона должен быть в международном формате (например, +79991234567)'
    })
    readonly phone: string;

    @ApiProperty({
        example: 'abc@gmail.com',
        description: 'Email пользователя',
        format: 'email'
    })
    @IsString({ message: 'Должно быть строкой' })
    @IsEmail({}, { message: 'Некорректный email' })
    readonly email: string;

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