import {ApiProperty} from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class AddRoleDto {

    @ApiProperty({example: 'admin', description: 'Роль для выдачи'})
    @IsString({message: "Должно быть строкой"})
    readonly value: string;

    @ApiProperty({example: '4', description: 'ID пользователя'})
    @IsNumber({},{message: "Должно быть числом"})
    readonly userId: number;
}