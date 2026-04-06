import {ApiProperty} from "@nestjs/swagger";

export class AddRoleDto {

    @ApiProperty({example: 'admin', description: 'Роль для выдачи'})
    readonly value: string;

    @ApiProperty({example: '4', description: 'ID пользователя'})
    readonly userId: number;
}