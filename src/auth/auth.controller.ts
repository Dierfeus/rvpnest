import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthService } from "./auth.service";
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from 'src/users/dto/login-user.dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/login')
    @ApiOperation({
        summary: 'Вход в систему',
        description: 'Авторизация пользователя по email или номеру телефона и паролю.'
    })
    @ApiResponse({
        status: 200,
        description: 'Успешный вход. Возвращает JWT токен.',
        schema: {
            example: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: 1,
                    firstName: 'Иван',
                    lastName: 'Петров',
                    email: 'abc@gmail.com',
                    phone: '+79991234567',
                    roles: ['user']
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Неверный email/телефон или пароль' })
    login(@Body() userDto: LoginUserDto) {
        return this.authService.login(userDto);
    }

    @Post('/registration')
    @ApiOperation({
        summary: 'Регистрация пользователя',
        description: 'Создание нового пользователя с ролью "user".'
    })
    @ApiResponse({
        status: 201,
        description: 'Пользователь успешно зарегистрирован. Возвращает JWT токен.',
        schema: {
            example: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: 1,
                    firstName: 'Иван',
                    lastName: 'Петров',
                    email: 'abc@gmail.com',
                    phone: '+79991234567',
                    roles: ['user']
                }
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Некорректные данные или пользователь уже существует'
    })
    registration(@Body() userDto: CreateUserDTO) {
        return this.authService.registration(userDto);
    }
}