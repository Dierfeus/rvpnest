import {Body, HttpException, HttpStatus, Injectable, Post, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {UsersService} from "../users/users.service";
import {CreateUserDTO} from '../users/dto/create-user.dto';
import bcrypt from 'node_modules/bcryptjs';


@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private jwtService: JwtService) {
    }

    async login(userDto: CreateUserDTO) {
        const user = await this.validateUser(userDto);
        return this.generateToken(user)
    }


    async registration(userDto: CreateUserDTO) {
        const candidate = await this.userService.getUserByEmail(userDto.email)
        if (candidate) {
            throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5)
        const user = await this.userService.createUser({...userDto, password: hashPassword})
        return this.generateToken(user);
    }

    private async generateToken(user) {
        const payload = {email: user.email, id: user.id, roles: user.roles};
        return {
            token: this.jwtService.sign(payload),
        }
    }


    private async validateUser(userDto: CreateUserDTO) {
        const user = await this.userService.getUserByEmail(userDto.email);
        // @ts-ignore
        const passwordEquals = await bcrypt.compare(userDto.password, user.password)
        if (user && passwordEquals) {
            return user;
        }
        throw new UnauthorizedException({message: 'Введен неверный email или пароль.'});
    }
}



