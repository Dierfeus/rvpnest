import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDTO {

    @ApiProperty({example: 'abc@gmail.com', description: 'User email'})
    readonly email: string;

    @ApiProperty({example: 'qwerty123', description: 'User password'})
    readonly password: string;
}
