import {IsNumber, IsString} from "class-validator";
import {Type} from "class-transformer";

export class CreatePostDto {

    @IsString({message: "Должно быть строкой"})
    readonly title: string;

    @IsString({message: "Должно быть строкой"})
    readonly content: string;

    @Type(() => Number)
    @IsNumber({},{message: "Должно быть числом"})
    readonly userId: number;
}