import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from "../users/users.service";
import { CreateUserDTO } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async login(userDto: CreateUserDTO) {
        const user = await this.validateUser(userDto);
        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDTO) {
        // Проверка email
        const candidateByEmail = await this.userService.getUserByEmail(userDto.email);
        if (candidateByEmail) {
            throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
        }

        // Проверка телефона
        const candidateByPhone = await this.userService.getUserByPhone(userDto.phone);
        if (candidateByPhone) {
            throw new HttpException('Пользователь с таким номером телефона уже существует', HttpStatus.BAD_REQUEST);
        }

        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({
            ...userDto,
            password: hashPassword
        });
        return this.generateToken(user);
    }

    private async generateToken(user) {
        const payload = {
            email: user.email,
            id: user.id,
            roles: user.roles,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone
        };
        return {
            token: this.jwtService.sign(payload),
        };
    }

    private async validateUser(userDto: CreateUserDTO) {
        // Используем email для входа
        const user = await this.userService.getUserByEmail(userDto.email);
        if (!user) {
            throw new UnauthorizedException({ message: 'Неверный email или пароль.' });
        }

        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (passwordEquals) {
            return user;
        }
        throw new UnauthorizedException({ message: 'Неверный email или пароль.' });
    }
}