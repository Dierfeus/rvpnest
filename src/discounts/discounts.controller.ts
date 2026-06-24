import {
  Controller, Get, Post, Body, Param, Put, Delete,
  UseGuards, HttpCode, HttpStatus, Query
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiBody, ApiQuery, ApiOkResponse, ApiCreatedResponse,
  ApiNotFoundResponse, ApiBadRequestResponse, ApiForbiddenResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CreateDiscountTypeDto } from './dto/create-discount-type.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount } from './discount.model';
import { DiscountType } from './discount-type.model';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Скидки')
@Controller('discounts')
export class DiscountsController {
  constructor(private discountsService: DiscountsService) {}

  // ==================== ТИПЫ СКИДОК ====================

  @Post('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать тип скидки (Админ)',
    description: 'Создает новый тип скидки. Доступно только администраторам.'
  })
  @ApiCreatedResponse({ type: DiscountType })
  @ApiBadRequestResponse({ description: 'Тип скидки уже существует' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  createType(@Body() dto: CreateDiscountTypeDto) {
    return this.discountsService.createDiscountType(dto);
  }

  @Get('types')
  @ApiOperation({
    summary: 'Получить все типы скидок'
  })
  @ApiOkResponse({ type: [DiscountType] })
  getAllTypes() {
    return this.discountsService.getAllDiscountTypes();
  }

  // ==================== СКИДКИ ====================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать скидку (Админ)',
    description: 'Создает новую скидку. Для акций передавайте productIds.'
  })
  @ApiCreatedResponse({ type: Discount })
  @ApiBody({ type: CreateDiscountDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  create(@Body() dto: CreateDiscountDto) {
    return this.discountsService.createDiscount(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все скидки'
  })
  @ApiOkResponse({ type: [Discount] })
  getAll() {
    return this.discountsService.getAllDiscounts();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Получить активные скидки'
  })
  @ApiOkResponse({ type: [Discount] })
  getActive() {
    return this.discountsService.getActiveDiscounts();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить скидку по ID'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOkResponse({ type: Discount })
  @ApiNotFoundResponse({ description: 'Скидка не найдена' })
  getById(@Param('id') id: number) {
    return this.discountsService.getDiscountById(id);
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Получить скидку по коду'
  })
  @ApiParam({ name: 'code', type: 'string' })
  @ApiOkResponse({ type: Discount })
  @ApiNotFoundResponse({ description: 'Промокод не найден' })
  getByCode(@Param('code') code: string) {
    return this.discountsService.getDiscountByCode(code);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить скидку (Админ)'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateDiscountDto })
  @ApiOkResponse({ type: Discount })
  @ApiNotFoundResponse({ description: 'Скидка не найдена' })
  update(@Param('id') id: number, @Body() dto: UpdateDiscountDto) {
    return this.discountsService.updateDiscount(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить скидку (Админ)'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiNotFoundResponse({ description: 'Скидка не найдена' })
  delete(@Param('id') id: number) {
    return this.discountsService.deleteDiscount(id);
  }

  // ==================== ПРИВЯЗКА К ТОВАРАМ ====================

  @Post(':discountId/products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Привязать товар к скидке (Админ)'
  })
  @ApiParam({ name: 'discountId', type: 'number' })
  @ApiParam({ name: 'productId', type: 'number' })
  @ApiOkResponse({ description: 'Товар привязан к скидке' })
  addProductToDiscount(
      @Param('discountId') discountId: number,
      @Param('productId') productId: number
  ) {
    return this.discountsService.addProductToDiscount(discountId, productId);
  }

  @Delete(':discountId/products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Отвязать товар от скидки (Админ)'
  })
  @ApiParam({ name: 'discountId', type: 'number' })
  @ApiParam({ name: 'productId', type: 'number' })
  @ApiOkResponse({
    description: 'Товар отвязан от скидки',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Товар с ID 5 успешно отвязан от скидки 3' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Связь не найдена' })
  @HttpCode(HttpStatus.OK)
  async removeProductFromDiscount(
      @Param('discountId') discountId: number,
      @Param('productId') productId: number
  ) {
    return this.discountsService.removeProductFromDiscount(discountId, productId);
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Получить скидки по товару'
  })
  @ApiParam({ name: 'productId', type: 'number' })
  @ApiOkResponse({ description: 'Скидки товара' })
  getDiscountsByProduct(@Param('productId') productId: number) {
    return this.discountsService.getDiscountsByProduct(productId);
  }

  @Get(':discountId/products')
  @ApiOperation({
    summary: 'Получить товары по скидке'
  })
  @ApiParam({ name: 'discountId', type: 'number' })
  @ApiOkResponse({ description: 'Товары со скидкой' })
  getProductsByDiscount(@Param('discountId') discountId: number) {
    return this.discountsService.getProductsByDiscount(discountId);
  }
}