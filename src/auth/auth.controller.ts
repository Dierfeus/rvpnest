import {Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {AuthService} from "./auth.service";
import { CreateUserDTO } from 'src/users/dto/create-user.dto';


@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {
    }

    @Post('/login')
    login(@Body() userDto: CreateUserDTO) {
        return this.authService.login(userDto)
    }

    @Post('/registration')
    registration(@Body() userDto: CreateUserDTO) {
        return this.authService.registration(userDto)
    }

}

