import {
    Body, Controller, Get, Param, Post, Put, Delete, Patch,
    UseGuards, HttpCode, HttpStatus, Query, Req
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiBearerAuth,
    ApiParam, ApiQuery, ApiBody, ApiBadRequestResponse,
    ApiNotFoundResponse, ApiUnauthorizedResponse, ApiForbiddenResponse,
    ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse
} from '@nestjs/swagger';
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from './users.service';
import { User } from "./users.model";
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from "../auth/roles.guard";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BanUserDto } from './dto/ban-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';


@ApiTags('Пользователи')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    @ApiOperation({
        summary: 'Создать пользователя',
        description: 'Регистрация нового пользователя. Роль "user" назначается автоматически.'
    })
    @ApiCreatedResponse({
        type: User,
        description: 'Пользователь успешно создан'
    })
    @ApiBadRequestResponse({ description: 'Некорректные данные или email/телефон уже существует' })
    @ApiBody({ type: CreateUserDTO })
    create(@Body() userDto: CreateUserDTO) {
        return this.usersService.createUser(userDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Получить профиль текущего пользователя',
        description: 'Возвращает информацию о текущем авторизованном пользователе.'
    })
    @ApiOkResponse({
        type: User,
        description: 'Информация о профиле'
    })
    @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
    getProfile(@Req() req: any) {
        return this.usersService.getUserID(req.user.id);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Обновить профиль текущего пользователя',
        description: 'Обновление данных текущего авторизованного пользователя.'
    })
    @ApiOkResponse({
        type: User,
        description: 'Профиль успешно обновлен'
    })
    @ApiBadRequestResponse({ description: 'Некорректные данные' })
    @ApiBody({ type: UpdateUserDto })
    updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(req.user.id, dto);
    }

    @Patch('profile/password')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Сменить пароль',
        description: 'Смена пароля текущего пользователя. Требуется старый пароль.'
    })
    @ApiOkResponse({
        description: 'Пароль успешно изменен'
    })
    @ApiBadRequestResponse({ description: 'Неверный старый пароль или новые данные' })
    @ApiBody({ type: ChangePasswordDto })
    changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        return this.usersService.changePassword(req.user.id, dto);
    }

    @Delete('profile')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Удалить свой аккаунт',
        description: 'Удаление собственного аккаунта пользователем.'
    })
    @ApiNoContentResponse({
        description: 'Аккаунт успешно удален'
    })
    @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
    deleteProfile(@Req() req: any) {
        return this.usersService.deleteUser(req.user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Получить всех пользователей (Админ)',
        description: 'Возвращает список всех пользователей с пагинацией. Доступно только администраторам.'
    })
    @ApiOkResponse({
        type: [User],
        description: 'Список всех пользователей'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество записей на странице (по умолчанию 10)'
    })
    @ApiQuery({
        name: 'offset',
        required: false,
        type: Number,
        description: 'Смещение для пагинации (по умолчанию 0)'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Поиск по email, имени, фамилии или телефону'
    })
    getAll(
        @Query('limit') limit: number = 10,
        @Query('offset') offset: number = 0,
        @Query('search') search?: string
    ) {
        return this.usersService.getAllUsers(limit, offset, search);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Получить пользователя по ID (Админ)',
        description: 'Возвращает информацию о пользователе по его ID. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID пользователя',
        example: 1
    })
    @ApiOkResponse({
        type: User,
        description: 'Информация о пользователе'
    })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    getUserById(@Param('id') id: number) {
        return this.usersService.getUserID(id);
    }

    @Get('email/:email')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Получить пользователя по email (Админ)',
        description: 'Поиск пользователя по email. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'email',
        type: 'string',
        description: 'Email пользователя',
        example: 'user@gmail.com'
    })
    @ApiOkResponse({
        type: User,
        description: 'Информация о пользователе'
    })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    getUserByEmail(@Param('email') email: string) {
        return this.usersService.getUserByEmail(email);
    }

    @Get('phone/:phone')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Получить пользователя по телефону (Админ)',
        description: 'Поиск пользователя по номеру телефона. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'phone',
        type: 'string',
        description: 'Номер телефона пользователя',
        example: '+79991234567'
    })
    @ApiOkResponse({
        type: User,
        description: 'Информация о пользователе'
    })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    getUserByPhone(@Param('phone') phone: string) {
        return this.usersService.getUserByPhone(phone);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Обновить пользователя по ID (Админ)',
        description: 'Обновление данных пользователя. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID пользователя',
        example: 1
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiOkResponse({
        type: User,
        description: 'Пользователь успешно обновлен'
    })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    @ApiBadRequestResponse({ description: 'Некорректные данные' })
    updateUser(
        @Param('id') id: number,
        @Body() dto: UpdateUserDto
    ) {
        return this.usersService.updateUser(id, dto);
    }

    @Put(':id/roles')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Обновить роли пользователя (Админ)',
        description: 'Полностью заменяет набор ролей пользователя. Передайте массив ID ролей, которые должны быть у пользователя. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID пользователя',
        example: 1
    })
    @ApiBody({ type: UpdateUserRolesDto })
    @ApiOkResponse({
        description: 'Роли успешно обновлены',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Роли успешно обновлены' },
                roles: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            value: { type: 'string', example: 'admin' },
                            description: { type: 'string', example: 'Администратор' }
                        }
                    }
                }
            }
        }
    })
    @ApiNotFoundResponse({ description: 'Пользователь или роль не найдены' })
    @ApiBadRequestResponse({ description: 'Некорректные данные или пустой массив ролей' })
    @ApiForbiddenResponse({ description: 'Недостаточно прав' })
    async updateUserRoles(
        @Param('id') id: number,
        @Body() dto: UpdateUserRolesDto
    ) {
        return this.usersService.updateUserRoles(id, dto.roleIds);
    }

    @Post('ban')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Забанить пользователя (Админ)',
        description: 'Блокировка пользователя с указанием причины. Доступно только администраторам.'
    })
    @ApiBody({ type: BanUserDto })
    @ApiOkResponse({
        description: 'Пользователь успешно забанен'
    })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    @ApiBadRequestResponse({ description: 'Некорректные данные' })
    ban(@Body() dto: BanUserDto) {
        return this.usersService.ban(dto);
    }

    @Post('unban/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Разбанить пользователя (Админ)',
        description: 'Снятие блокировки с пользователя. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID пользователя',
        example: 1
    })
    @ApiOkResponse({
        description: 'Пользователь успешно разбанен'
    })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    @ApiBadRequestResponse({ description: 'Пользователь не забанен' })
    unban(@Param('id') id: number) {
        return this.usersService.unban(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Удалить пользователя (Админ)',
        description: 'Полное удаление пользователя из системы. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID пользователя',
        example: 1
    })
    @ApiNoContentResponse({
        description: 'Пользователь успешно удален'
    })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    deleteUser(@Param('id') id: number) {
        return this.usersService.deleteUser(id);
    }

}