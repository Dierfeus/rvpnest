import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, Model, Table, ForeignKey} from 'sequelize-typescript';
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";
import { UsersController } from 'src/users/users.controller';
import { User } from 'src/users/users.model';

interface PostCreationAttrs {
    title: string;
    content: string;
    userId: number;
    image: string;
}

@Table({tableName: 'posts'})
export class Post extends Model<Post, PostCreationAttrs> {

    @ApiProperty({example: '1', description: 'User ID'})
    @Column({type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true})
    declare id: number;

    @ApiProperty({example: 'Мой первый пост', description: 'Заголовок поста'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    declare title: string;

    @ApiProperty({example: 'Текст', description: 'Содержание поста'})
    @Column({type: DataType.STRING, allowNull: false})
    declare content: string;

    @ApiProperty({example: 'img', description: 'Изображение поста'})
    @Column({type: DataType.STRING, defaultValue: false })
    declare image: string;

    @ApiProperty({example: '1', description: 'id пользователя'})
    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull: false })
    userId: number;

    @BelongsTo(() => User)
    author: User;

}