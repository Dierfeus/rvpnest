import {
    Body, Controller, Get, Param, Post, Put, Delete,
    UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
    ApiParam, ApiBody, ApiNotFoundResponse, ApiForbiddenResponse
} from '@nestjs/swagger';
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "./roles.model";
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Роли')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RolesController {
    constructor(private roleService: RolesService) {}

    @Post()
    @ApiOperation({
        summary: 'Создать роль',
        description: 'Создание новой роли. Доступно только администраторам.'
    })
    @ApiBody({ type: CreateRoleDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: Role,
        description: 'Роль успешно создана'
    })
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.createRole(dto);
    }

    @Get()
    @ApiOperation({
        summary: 'Получить все роли',
        description: 'Возвращает список всех ролей.'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [Role],
        description: 'Список всех ролей'
    })
    getAll() {
        return this.roleService.getAllRoles();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Получить роль по ID',
        description: 'Возвращает информацию о роли по её ID.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID роли',
        example: 1
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Role,
        description: 'Информация о роли'
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    getById(@Param('id') id: number) {
        return this.roleService.getRoleById(id);
    }

    @Get('value/:value')
    @ApiOperation({
        summary: 'Получить роль по значению',
        description: 'Поиск роли по её значению (например, "admin").'
    })
    @ApiParam({
        name: 'value',
        type: 'string',
        description: 'Значение роли',
        example: 'admin'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Role,
        description: 'Информация о роли'
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    getByValue(@Param('value') value: string) {
        return this.roleService.getRoleByValue(value);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Обновить роль',
        description: 'Обновление данных роли по ID. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID роли',
        example: 1
    })
    @ApiBody({ type: UpdateRoleDto })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Role,
        description: 'Роль успешно обновлена'
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    update(
        @Param('id') id: number,
        @Body() dto: UpdateRoleDto
    ) {
        return this.roleService.updateRole(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Удалить роль',
        description: 'Полное удаление роли из системы. Доступно только администраторам.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID роли',
        example: 1
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Роль успешно удалена'
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    delete(@Param('id') id: number) {
        return this.roleService.deleteRole(id);
    }
}