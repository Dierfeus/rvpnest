import {
  Controller, Get, Post, Body, Param, Put, Delete,
  UseGuards, HttpCode, HttpStatus, Query
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiBody, ApiNotFoundResponse, ApiForbiddenResponse,
  ApiQuery, ApiOkResponse, ApiCreatedResponse
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './categories.model';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Категории')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // ==================== PUBLIC ENDPOINTS ====================
  @Get()
  @ApiOperation({
    summary: 'Получить все категории',
    description: 'Возвращает дерево категорий с вложенными подкатегориями.'
  })
  @ApiOkResponse({
    type: [Category],
    description: 'Список всех категорий'
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: Number,
    description: 'Фильтр по родительской категории (0 - корневые, null - все)'
  })
  getAll(@Query('parentId') parentId?: number) {
    return this.categoriesService.getAll(parentId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить категорию по ID',
    description: 'Возвращает информацию о категории с её подкатегориями.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID категории',
    example: 1
  })
  @ApiOkResponse({
    type: Category,
    description: 'Информация о категории'
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  getOne(@Param('id') id: number) {
    return this.categoriesService.getOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать категорию (Админ)',
    description: 'Создание новой категории. Доступно только администраторам.'
  })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      root: {
        summary: 'Корневая категория',
        value: {
          category: 'Ноутбуки',
          id_parent_category: null,
          image_url: 'https://example.com/images/laptops.jpg',
          icon_class: 'fa-laptop',
          description: 'Ноутбуки всех брендов'
        }
      },
      child: {
        summary: 'Подкатегория',
        value: {
          category: 'Apple (MacBook)',
          id_parent_category: 1,
          image_url: 'https://example.com/images/apple.jpg',
          icon_class: 'fa-apple',
          description: 'Ноутбуки Apple MacBook'
        }
      }
    }
  })
  @ApiCreatedResponse({
    type: Category,
    description: 'Категория успешно создана'
  })
  @ApiForbiddenResponse({ description: 'Недостаточно прав (требуется роль admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить категорию (Админ)',
    description: 'Обновление данных категории. Доступно только администраторам.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID категории',
    example: 1
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({
    type: Category,
    description: 'Категория успешно обновлена'
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав (требуется роль admin)' })
  update(
      @Param('id') id: number,
      @Body() dto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить категорию (Админ)',
    description: 'Удаление категории. Доступно только администраторам.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID категории',
    example: 1
  })
  @ApiOkResponse({
    description: 'Категория успешно удалена'
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав (требуется роль admin)' })
  delete(@Param('id') id: number) {
    return this.categoriesService.delete(id);
  }
}