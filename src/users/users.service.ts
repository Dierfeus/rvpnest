import {Injectable, Param} from '@nestjs/common';
import {User} from "./users.model";
import { InjectModel } from '@nestjs/sequelize';
import {CreateUserDTO} from './dto/create-user.dto';
import {RolesService} from "../roles/roles.service";
import { Role } from 'src/roles/roles.model';

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
        const user = await this.userRepository.findOne({where: {email},  include: [Role]
        });
        if (user) user.roles = user.dataValues.roles
        return user;
    }
}
