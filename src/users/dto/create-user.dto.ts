import {ApiProperty} from "@nestjs/swagger";
import { IsString, Length, IsEmail } from "class-validator";

export class CreateUserDTO {

    @ApiProperty({example: 'abc@gmail.com', description: 'User email'})
    @IsString({message: 'Должно быть строкой'})
    @IsEmail({}, {message: 'Некоректный email'})
    readonly email: string;

    @ApiProperty({example: 'qwerty123', description: 'User password'})
    @IsString({message: 'Должно быть строкой'})
    @Length(4, 16, {message: 'Не меньше 4 и не больше 16 символов'})
    readonly password: string;
}
