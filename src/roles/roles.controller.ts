import {
    Body, Controller, Get, Param, Post, Put, Delete,
    UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
    ApiParam, ApiBody, ApiNotFoundResponse, ApiForbiddenResponse,
    ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse
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
    @ApiBody({
        type: CreateRoleDto,
        description: 'Данные для создания роли',
        examples: {
            example1: {
                summary: 'Пример создания роли',
                value: {
                    value: 'admin',
                    description: 'Администратор системы'
                }
            }
        }
    })
    @ApiCreatedResponse({
        type: Role,
        description: 'Роль успешно создана',
        schema: {
            example: {
                id: 1,
                value: 'admin',
                description: 'Администратор системы',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Некорректные данные или роль уже существует'
    })
    @ApiForbiddenResponse({ description: 'Недостаточно прав' })
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.createRole(dto);
    }

    @Get()
    @ApiOperation({
        summary: 'Получить все роли',
        description: 'Возвращает список всех ролей.'
    })
    @ApiOkResponse({
        type: [Role],
        description: 'Список всех ролей',
        schema: {
            example: [
                {
                    id: 1,
                    value: 'admin',
                    description: 'Администратор системы',
                    createdAt: '2025-01-01T00:00:00.000Z',
                    updatedAt: '2025-01-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    value: 'user',
                    description: 'Обычный пользователь',
                    createdAt: '2025-01-01T00:00:00.000Z',
                    updatedAt: '2025-01-01T00:00:00.000Z'
                }
            ]
        }
    })
    @ApiForbiddenResponse({ description: 'Недостаточно прав' })
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
        example: 1,
        required: true
    })
    @ApiOkResponse({
        type: Role,
        description: 'Информация о роли',
        schema: {
            example: {
                id: 1,
                value: 'admin',
                description: 'Администратор системы',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    @ApiForbiddenResponse({ description: 'Недостаточно прав' })
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
        example: 'admin',
        required: true
    })
    @ApiOkResponse({
        type: Role,
        description: 'Информация о роли',
        schema: {
            example: {
                id: 1,
                value: 'admin',
                description: 'Администратор системы',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    @ApiForbiddenResponse({ description: 'Недостаточно прав' })
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
        example: 1,
        required: true
    })
    @ApiBody({
        type: UpdateRoleDto,
        description: 'Данные для обновления роли',
        examples: {
            example1: {
                summary: 'Пример обновления роли',
                value: {
                    value: 'super_admin',
                    description: 'Супер администратор'
                }
            }
        }
    })
    @ApiOkResponse({
        type: Role,
        description: 'Роль успешно обновлена',
        schema: {
            example: {
                id: 1,
                value: 'super_admin',
                description: 'Супер администратор',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    @ApiBadRequestResponse({ description: 'Некорректные данные' })
    @ApiForbiddenResponse({ description: 'Недостаточно прав' })
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
        example: 1,
        required: true
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Роль успешно удалена'
    })
    @ApiNotFoundResponse({ description: 'Роль не найдена' })
    @ApiForbiddenResponse({ description: 'Недостаточно прав' })
    delete(@Param('id') id: number) {
        return this.roleService.deleteRole(id);
    }
}