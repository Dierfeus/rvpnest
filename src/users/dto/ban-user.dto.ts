import {ApiProperty} from "@nestjs/swagger";

export class BanUserDto {

    @ApiProperty({example: '4', description: 'ID пользователя'})
    readonly userId: number;

    @ApiProperty({example: 'Хулиганство', description: 'Причина блокировки'})
    readonly banReason: string;
}