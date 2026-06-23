import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class UpdateUserRolesDto {
    @ApiProperty({
        example: [1, 2],
        description: 'Массив ID ролей, которые должны быть у пользователя',
        minItems: 1
    })
    @IsArray({ message: 'Должно быть массивом' })
    @ArrayMinSize(1, { message: 'У пользователя должна быть хотя бы одна роль' })
    @IsNumber({}, { each: true, message: 'Каждый элемент должен быть числом' })
    readonly roleIds: number[];
}