import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {CreateUserDTO} from "./dto/create-user.dto";
import { UsersService } from './users.service';
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {User} from "./users.model";
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import {RolesGuard} from "../auth/roles.guard";

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {


    constructor(private usersService: UsersService) {}

    @ApiOperation({summary: 'Создание пользователя'})
    @ApiResponse({status: 200, type: User})
    @Post()
    create(@Body() userDto: CreateUserDTO) {
        return this.usersService.createUser(userDto);
    }
    @ApiOperation({summary: 'Получить всех пользователей'})
    @ApiResponse({status: 200, type: [User]})
    @UseGuards(RolesGuard)
    @Roles('admin')
    @Get()
    getAll() {
        return this.usersService.getAllUsers()
    }

    @ApiOperation({summary: 'Получить пользователя по id'})
    @ApiResponse({status: 200, type: User})
    @Get(`/:id`)
    getUserId(@Param('id') id: number) {
        return this.usersService.getUserID(id)
    }
}
