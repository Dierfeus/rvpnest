import {Injectable, Param, HttpException, HttpStatus} from '@nestjs/common';
import {User} from "./users.model";
import { InjectModel } from '@nestjs/sequelize';
import {CreateUserDTO} from './dto/create-user.dto';
import {RolesService} from "../roles/roles.service";
import { Role } from 'src/roles/roles.model';
import { AddRoleDto } from './dto/add.role.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { threadId } from 'worker_threads';

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService) {

    }
    async createUser(dto: CreateUserDTO) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue('user')
        // @ts-ignore
        await user.$set('roles', [role.id]);
        // @ts-ignore
        user.roles = [role];
        return user;
    }

    async getAllUsers(){
        const users = await this.userRepository.findAll({include: {all: true}});
        return users;
    }

    async getUserID(@Param('id') id: number){
        const user = await this.userRepository.findByPk(id);
        return user;
    }

    async getUserByEmail(email: string){
        const user = await this.userRepository.findOne({where: {email}, include: {all: true}});
        if (user) user.roles = user.dataValues.roles
        return user;
    }

    async addRole(dto: AddRoleDto){
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value)
        if(role && user){
            await user.$add('role', role.id)
            return dto;
        }
        throw new HttpException('Пользователь или роль не неайдена', HttpStatus.NOT_FOUND)
    }

    async ban(dto: BanUserDto){
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Пользователь не неайден', HttpStatus.NOT_FOUND)
        } 
        user.banned = true;
        user.banReason = dto.banReason;
        await user.save();
        return user;
    }
}
