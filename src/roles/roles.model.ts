import { ApiProperty } from '@nestjs/swagger';
import {BelongsToMany, Column, DataType, Model, Table} from 'sequelize-typescript';
import {User} from "../users/users.model";
import { UserRoles } from './user-roles.model';

interface RoleCreationAttrs {
    value: string;
    description: string;
}

@Table({tableName: 'roles'})
export class Role extends Model<Role, RoleCreationAttrs> {
    @ApiProperty({example: '1', description: 'User ID'})
    @Column({type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true})
    declare id: number;

    @ApiProperty({example: 'ADMIN', description: 'Роль пользователя'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    value: string;

    @ApiProperty({example: 'Самый главный', description: 'Описание роли'})
    @Column({type: DataType.STRING, allowNull: true})
    description: string;

    @BelongsToMany(() => User, () => UserRoles)
    users: User[];

}