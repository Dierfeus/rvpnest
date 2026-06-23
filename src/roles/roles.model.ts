import { ApiProperty } from '@nestjs/swagger';
import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { User } from "../users/users.model";
import { UserRoles } from './user-roles.model';

interface RoleCreationAttrs {
    value: string;
    description: string;
}

@Table({ tableName: 'roles' })
export class Role extends Model<Role, RoleCreationAttrs> {
    @ApiProperty({
        example: 1,
        description: 'ID роли'
    })
    @Column({ type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ApiProperty({
        example: 'admin',
        description: 'Значение роли (уникальное)'
    })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    value: string;

    @ApiProperty({
        example: 'Администратор системы',
        description: 'Описание роли',
        required: false
    })
    @Column({ type: DataType.STRING, allowNull: true })
    description: string;

    @ApiProperty({
        example: '2025-01-01T00:00:00.000Z',
        description: 'Дата создания'
    })

    @ApiProperty({
        example: '2025-01-01T00:00:00.000Z',
        description: 'Дата обновления'
    })

    @BelongsToMany(() => User, () => UserRoles)
    users: User[];
}