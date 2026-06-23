import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDto {
    @ApiProperty({
        example: 'SUPER_ADMIN',
        description: 'Новое значение роли',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    readonly value?: string;

    @ApiProperty({
        example: 'Самый главный администратор',
        description: 'Новое описание роли',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    readonly description?: string;
}