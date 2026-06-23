import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateRoleDto {
    @ApiProperty({
        example: 'super_admin',
        description: 'Новое значение роли',
        required: false,
        minLength: 2,
        maxLength: 50
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    @Length(2, 50, { message: 'Значение роли должно быть от 2 до 50 символов' })
    readonly value?: string;

    @ApiProperty({
        example: 'Самый главный администратор с полным доступом',
        description: 'Новое описание роли',
        required: false,
        maxLength: 255
    })
    @IsOptional()
    @IsString({ message: 'Должно быть строкой' })
    @Length(0, 255, { message: 'Описание не должно превышать 255 символов' })
    readonly description?: string;
}