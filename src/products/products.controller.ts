// products.controller.ts
import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus, Query, Req
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody, ApiOkResponse, ApiCreatedResponse,
  ApiNotFoundResponse, ApiBadRequestResponse, ApiUnauthorizedResponse
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
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создать товар (Админ)' })
  @ApiCreatedResponse({ type: Product })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все товары' })
  @ApiOkResponse({ type: [Product] })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAllProducts(
      @Query('categoryId') categoryId?: number,
      @Query('minPrice') minPrice?: number,
      @Query('maxPrice') maxPrice?: number,
      @Query('search') search?: string,
      @Query('limit') limit: number = 10,
      @Query('offset') offset: number = 0,
  ) {
    return this.productsService.getAll({
      categoryId,
      minPrice,
      maxPrice,
      search,
      limit,
      offset
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  async getProductById(@Param('id') id: number) {
    return this.productsService.getOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Получить остаток товара' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOkResponse({ schema: { properties: { productId: { type: 'number' }, stock: { type: 'number' } } } })
  async getProductStock(@Param('id') id: number) {
    const stock = await this.productsService.getProductStock(id);
    return { productId: id, stock };
  }

  @Get(':id/movement')
  @ApiOperation({ summary: 'Получить движение товара' })
  @ApiParam({ name: 'id', type: 'number' })
  async getProductMovement(@Param('id') id: number) {
    return this.productsService.getProductMovement(id);
  }

  @Post('entrance')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Добавить поступление товара (Админ)' })
  @ApiBody({ type: CreateEntranceDto })
  @ApiCreatedResponse({ description: 'Поступление добавлено' })
  async createEntrance(@Body() dto: CreateEntranceDto) {
    return this.productsService.createEntrance(dto);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновить товар (Админ)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  async updateProduct(
      @Param('id') id: number,
      @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить товар (Админ)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  async deleteProduct(@Param('id') id: number) {
    return this.productsService.deleteProduct(id);
  }

  @Post('characteristics')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Добавить характеристики товару (Админ)' })
  @ApiBody({ type: AddProductCharacteristicDto })
  @ApiCreatedResponse({ description: 'Характеристики добавлены' })
  async addCharacteristics(@Body() dto: AddProductCharacteristicDto) {
    return this.productsService.addCharacteristics(dto);
  }

  @Post(':id/entrance')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Добавить поступление товара по ID (Админ)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ schema: { properties: { quantity: { type: 'number' }, purchasePrice: { type: 'number' } } } })
  async addEntrance(
      @Param('id') id: number,
      @Body() body: { quantity: number; purchasePrice: number },
  ) {
    return this.productsService.addEntrance(
        id,
        body.quantity,
        body.purchasePrice,
    );
  }
}