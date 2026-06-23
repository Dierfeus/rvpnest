import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

    async createRole(dto: CreateRoleDto) {
        const existingRole = await this.roleRepository.findOne({
            where: { value: dto.value }
        });
        if (existingRole) {
            throw new HttpException('Роль с таким значением уже существует', HttpStatus.BAD_REQUEST);
        }
        return this.roleRepository.create(dto as any);
    }

    async getAllRoles() {
        return this.roleRepository.findAll({ include: ['users'] });
    }

    // ✅ ДОБАВЛЯЕМ ЭТОТ МЕТОД
    async getRoleById(id: number) {
        const role = await this.roleRepository.findByPk(id);
        if (!role) {
            throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
        }
        return role;
    }

    async getRoleByValue(value: string) {
        const role = await this.roleRepository.findOne({
            where: { value },
            include: ['users']
        });
        if (!role) {
            throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
        }
        return role;
    }

    async updateRole(id: number, dto: UpdateRoleDto) {
        const role = await this.getRoleById(id);
        await role.update(dto);
        return role;
    }

    async deleteRole(id: number) {
        const role = await this.getRoleById(id);
        await role.destroy();
        return { message: 'Роль удалена' };
    }
}