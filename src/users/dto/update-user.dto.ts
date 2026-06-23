import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, Length, Matches } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        example: 'Иван',
        description: 'Новое имя пользователя',
        required: false,
        minLength: 2,
        maxLength: 50
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    @Length(2, 50, { message: 'Имя должно содержать от 2 до 50 символов' })
    readonly firstName?: string;

    @ApiProperty({
        example: 'Петров',
        description: 'Новая фамилия пользователя',
        required: false,
        minLength: 2,
        maxLength: 50
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    @Length(2, 50, { message: 'Фамилия должна содержать от 2 до 50 символов' })
    readonly lastName?: string;

    @ApiProperty({
        example: '+7 (999) 123-45-67',
        description: 'Новый номер телефона',
        required: false,
        pattern: '^\\+?[1-9]\\d{1,14}$'
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Номер телефона должен быть в международном формате (например, +79991234567)'
    })
    readonly phone?: string;

    @ApiProperty({
        example: 'newemail@gmail.com',
        description: 'Новый email пользователя',
        required: false,
        format: 'email'
    })
    @IsOptional()
    @IsEmail({}, { message: 'Некорректный email' })
    readonly email?: string;

    @ApiProperty({
        example: 'newpassword123',
        description: 'Новый пароль',
        required: false,
        minLength: 4,
        maxLength: 16
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    @Length(4, 16, { message: 'Не меньше 4 и не больше 16 символов' })
    readonly password?: string;
}