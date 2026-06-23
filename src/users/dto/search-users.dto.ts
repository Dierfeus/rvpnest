import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class SearchUsersDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    readonly email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    readonly firstName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    readonly lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    readonly phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    readonly banned?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    readonly role?: string;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @IsNumber()
    readonly limit?: number;

    @ApiProperty({ required: false, default: 10 })
    @IsOptional()
    @IsNumber()
    readonly offset?: number;
}