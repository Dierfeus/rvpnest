import { ApiProperty } from '@nestjs/swagger';
import {Column, DataType, Model, Table} from 'sequelize-typescript';

interface UserCreationAttrs {
    email: string;
    password: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty({example: '1', description: 'User ID'})
    @Column({type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true})
    declare id: number;
    @ApiProperty({example: 'abc@gmail.com', description: 'User email'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;
    @ApiProperty({example: 'qwerty123', description: 'User password'})
    @Column({type: DataType.STRING, allowNull: false})
    password: string;
    @ApiProperty({example: 'false', description: 'User banned status'})
    @Column({type: DataType.BOOLEAN, defaultValue: false })
    banned: boolean;
    @ApiProperty({example: 'Пользователь нарушил правила', description: 'Ban reason'})
    @Column({type: DataType.STRING, allowNull: true})
    banReason: string;
}