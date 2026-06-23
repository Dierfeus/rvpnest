import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from "./users.model";
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesService } from "../roles/roles.service";
import { AddRoleDto } from './dto/add.role.dto';
import { BanUserDto } from './dto/ban-user.dto';
import * as bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userRepository: typeof User,
        private roleService: RolesService
    ) {}

    async createUser(dto: CreateUserDTO) {
        console.log('📝 createUser получил dto:', dto);
        console.log('📝 createUser получил пароль:', dto.password);
        console.log('📝 createUser получил пароль (длина):', dto.password?.length);

        // Проверка email
        const existingEmail = await this.userRepository.findOne({
            where: { email: dto.email }
        });
        if (existingEmail) {
            throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
        }

        // Проверка телефона
        const existingPhone = await this.userRepository.findOne({
            where: { phone: dto.phone }
        });
        if (existingPhone) {
            throw new HttpException('Пользователь с таким номером телефона уже существует', HttpStatus.BAD_REQUEST);
        }
        const user = await this.userRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            email: dto.email,
            password: dto.password
        });

        console.log('📝 createUser сохранил пользователя:', {
            id: user.id,
            email: user.email,
            passwordHash: user.password,
            passwordLength: user.password?.length
        });

        const role = await this.roleService.getRoleByValue('user');
        if (role) {
            await user.$set('roles', [role.id]);
        }

        return user;
    }

    async getAllUsers(limit: number = 10, offset: number = 0, search?: string) {
        const where: any = {};

        if (search) {
            where[Op.or] = [
                { email: { [Op.iLike]: `%${search}%` } },
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const options: any = {
            where,
            include: { all: true },
            attributes: { exclude: ['password'] },
            limit: Math.min(limit, 100),
            offset,
            order: [['id', 'DESC']]
        };

        return this.userRepository.findAll(options);
    }

    async getUserID(id: number) {
        const user = await this.userRepository.findByPk(id, {
            include: { all: true },
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            include: { all: true }
        });
        if (user) user.roles = user.dataValues.roles
        return user;
    }

    async getUserByPhone(phone: string) {
        const user = await this.userRepository.findOne({
            where: { phone },
            include: { all: true }
        });
        if (user) user.roles = user.dataValues.roles
        return user;
    }

    async updateUser(id: number, dto: UpdateUserDto) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        if (dto.phone) {
            const existingPhone = await this.userRepository.findOne({
                where: { phone: dto.phone }
            });
            if (existingPhone && existingPhone.id !== id) {
                throw new HttpException('Этот номер телефона уже используется', HttpStatus.BAD_REQUEST);
            }
        }

        if (dto.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: dto.email }
            });
            if (existingEmail && existingEmail.id !== id) {
                throw new HttpException('Этот email уже используется', HttpStatus.BAD_REQUEST);
            }
        }

        const updateData: any = { ...dto };

        if (dto.password) {
            updateData.password = await bcrypt.hash(dto.password, 5);
        }

        await user.update(updateData);
        return this.getUserID(id);
    }

    async changePassword(userId: number, dto: ChangePasswordDto) {
        const user = await this.userRepository.findByPk(userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new HttpException('Неверный текущий пароль', HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 5);
        await user.update({ password: hashedPassword });

        return { message: 'Пароль успешно изменен' };
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        const role = await this.roleService.getRoleByValue(dto.value);
        if (!role) {
            throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
        }

        const userRoles = await user.$get('roles');
        if (userRoles.some(r => r.value === dto.value)) {
            throw new HttpException('У пользователя уже есть эта роль', HttpStatus.BAD_REQUEST);
        }

        await user.$add('roles', role.id);
        return { message: 'Роль успешно назначена' };
    }

    async updateUserRoles(userId: number, roleIds: number[]) {
        const user = await this.userRepository.findByPk(userId, {
            include: ['roles']
        });
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        if (roleIds.length === 0) {
            throw new HttpException('У пользователя должна быть хотя бы одна роль', HttpStatus.BAD_REQUEST);
        }

        const roles = await Promise.all(
            roleIds.map(async (roleId) => {
                const role = await this.roleService.getRoleById(roleId);
                if (!role) {
                    throw new HttpException(`Роль с ID ${roleId} не найдена`, HttpStatus.NOT_FOUND);
                }
                return role;
            })
        );

        await user.$set('roles', roleIds);
        const updatedRoles = await user.$get('roles');

        return {
            message: 'Роли успешно обновлены',
            roles: updatedRoles
        };
    }

    async ban(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        if (user.banned) {
            throw new HttpException('Пользователь уже забанен', HttpStatus.BAD_REQUEST);
        }

        user.banned = true;
        user.banReason = dto.banReason;
        await user.save();
        return { message: 'Пользователь забанен', user };
    }

    async unban(id: number) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        if (!user.banned) {
            throw new HttpException('Пользователь не забанен', HttpStatus.BAD_REQUEST);
        }

        user.banned = false;
        user.banReason = "";
        await user.save();
        return { message: 'Пользователь разбанен', user };
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
        await user.destroy();
        return { message: 'Пользователь удален' };
    }
}