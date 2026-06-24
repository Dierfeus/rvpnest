import {
  Controller, Get, Post, Body, Param, Put, Delete, UseGuards,
  Query, HttpCode, HttpStatus
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiBody, ApiQuery, ApiOkResponse, ApiCreatedResponse,
  ApiNotFoundResponse, ApiBadRequestResponse, ApiForbiddenResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductCharacteristicDto } from './dto/add-product-characteristic.dto';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { Product } from './products.model';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Товары')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ====================

  @Get()
  @ApiOperation({
    summary: 'Получить все товары',
    description: 'Возвращает список всех активных товаров с пагинацией и фильтрацией.'
  })
  @ApiOkResponse({
    type: [Product],
    description: 'Список товаров'
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Фильтр по категории'
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Минимальная цена'
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Максимальная цена'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Поиск по названию'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество записей на странице'
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Смещение для пагинации'
  })
  async getAll(
      @Query('categoryId') categoryId?: number,
      @Query('minPrice') minPrice?: number,
      @Query('maxPrice') maxPrice?: number,
      @Query('search') search?: string,
      @Query('limit') limit: number = 20,
      @Query('offset') offset: number = 0
  ) {
    return this.productsService.getAll({ categoryId, minPrice, maxPrice, search, limit, offset });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить товар по ID',
    description: 'Возвращает полную информацию о товаре.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID товара',
    example: 1
  })
  @ApiOkResponse({
    type: Product,
    description: 'Информация о товаре'
  })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  async getOne(@Param('id') id: number) {
    return this.productsService.getOne(id);
  }

  @Get(':id/characteristics')
  @ApiOperation({
    summary: 'Получить характеристики товара',
    description: 'Возвращает все характеристики товара с их значениями.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID товара',
    example: 1
  })
  @ApiOkResponse({
    description: 'Характеристики товара'
  })
  async getProductCharacteristics(@Param('id') id: number) {
    return this.productsService.getProductCharacteristics(id);
  }

  @Get(':id/price')
  @ApiOperation({
    summary: 'Получить цену товара',
    description: 'Возвращает текущую цену товара.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID товара',
    example: 1
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', example: 49990 }
      }
    }
  })
  async getProductPrice(@Param('id') id: number) {
    return this.productsService.getProductPrice(id);
  }

  @Get('entrance/:productId')
  @ApiOperation({
    summary: 'Получить историю приходов товара',
    description: 'Возвращает все записи о приходах товара.'
  })
  @ApiParam({
    name: 'productId',
    type: 'number',
    description: 'ID товара',
    example: 1
  })
  @ApiOkResponse({
    description: 'История приходов товара'
  })
  async getEntrances(@Param('productId') productId: number) {
    return this.productsService.getEntrancesByProduct(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать товар',
    description: 'Создание нового товара. Доступно администраторам и продавцам.'
  })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({
    type: Product,
    description: 'Товар успешно создан'
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить товар',
    description: 'Обновление данных товара. Доступно администраторам и продавцам.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID товара',
    example: 1
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    type: Product,
    description: 'Товар успешно обновлен'
  })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  async update(
      @Param('id') id: number,
      @Body() dto: UpdateProductDto
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить товар',
    description: 'Полное удаление товара. Доступно администраторам и продавцам.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID товара',
    example: 1
  })
  @ApiOkResponse({
    description: 'Товар успешно удален'
  })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  async delete(@Param('id') id: number) {
    return this.productsService.delete(id);
  }

  @Post('characteristics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Добавить характеристики товару',
    description: 'Привязывает характеристики к товару. Доступно администраторам и продавцам.'
  })
  @ApiBody({ type: AddProductCharacteristicDto })
  @ApiOkResponse({
    description: 'Характеристики успешно добавлены'
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Товар или характеристика не найдены' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  async addCharacteristics(@Body() dto: AddProductCharacteristicDto) {
    return this.productsService.addCharacteristics(dto);
  }

  @Post('entrance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Записать приход товара',
    description: 'Добавляет запись о приходе товара. Доступно администраторам и продавцам.'
  })
  @ApiBody({ type: CreateEntranceDto })
  @ApiCreatedResponse({
    description: 'Приход успешно записан'
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  async createEntrance(@Body() dto: CreateEntranceDto) {
    return this.productsService.createEntrance(dto);
  }

  @Get(':id/movements')
  @ApiOperation({
    summary: 'Получить историю движений товара',
    description: 'Возвращает полную историю приходов и списаний товара.'
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID товара' })
  @ApiOkResponse({ description: 'История движений товара' })
  async getProductMovements(@Param('id') id: number) {
    return this.productsService.getProductMovements(id);
  }

  @Get(':id/stock')
  @ApiOperation({
    summary: 'Получить текущий остаток товара',
    description: 'Возвращает текущее количество товара на складе.'
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID товара' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Ноутбук Lenovo' },
        stock: { type: 'number', example: 10 }
      }
    }
  })
  async getStock(@Param('id') id: number) {
    const product = await this.productsService.getOne(id);
    return {
      productId: product.id_product,
      name: product.name,
      stock: product.stock
    };
  }
  
}