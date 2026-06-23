import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from "../users/users.service";
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { User } from '../users/users.model';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async login(userDto: LoginUserDto) {
        const user = await this.validateUser(userDto);
        const userWithRoles = await this.userService.getUserID(user.id);
        return this.generateToken(userWithRoles);
    }

    async registration(userDto: CreateUserDTO) {
        const candidateByEmail = await this.userService.getUserByEmail(userDto.email);
        if (candidateByEmail) {
            throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
        }

        const candidateByPhone = await this.userService.getUserByPhone(userDto.phone);
        if (candidateByPhone) {
            throw new HttpException('Пользователь с таким номером телефона уже существует', HttpStatus.BAD_REQUEST);
        }

        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({
            ...userDto,
            password: hashPassword
        });

        const userWithRoles = await this.userService.getUserID(user.id);
        return this.generateToken(userWithRoles);
    }

    private async generateToken(user: User) {
        // ✅ Извлекаем только value из ролей
        const userData = user.toJSON();
        const roles = userData.roles?.map(role => role.value) || [];

        const payload = {
            email: userData.email,
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            roles: roles // ✅ Теперь это массив строк: ['admin']
        };

        return {
            token: this.jwtService.sign(payload),
            user: {
                id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                roles: roles // ✅ Тоже массив строк
            }
        };
    }

    private async validateUser(userDto: LoginUserDto): Promise<User> {
        let user: User | null = null;

        const isEmail = userDto.login.includes('@') && userDto.login.includes('.');

        if (isEmail) {
            user = await this.userService.getUserByEmail(userDto.login);
        } else {
            user = await this.userService.getUserByPhone(userDto.login);
        }

        if (!user) {
            throw new UnauthorizedException({
                message: 'Пользователь с таким email или телефоном не найден'
            });
        }

        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (!passwordEquals) {
            throw new UnauthorizedException({ message: 'Неверный пароль' });
        }

        if (user.banned) {
            throw new UnauthorizedException({
                message: `Ваш аккаунт заблокирован. Причина: ${user.banReason || 'Не указана'}`
            });
        }

        return user;
    }
}