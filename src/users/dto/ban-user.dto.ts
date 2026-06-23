import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class BanUserDto {
    @ApiProperty({
        example: '4',
        description: 'ID пользователя'
    })
    @IsNumber({}, { message: 'ID пользователя должно быть числом' })
    @Min(1, { message: 'ID пользователя должен быть больше 0' })
    @IsNotEmpty({ message: 'ID пользователя обязательно' })
    readonly userId: number;

    @ApiProperty({
        example: 'Хулиганство',
        description: 'Причина блокировки'
    })
    @IsString({ message: 'Причина блокировки должна быть строкой' })
    @IsNotEmpty({ message: 'Причина блокировки обязательна' })
    readonly banReason: string;
}