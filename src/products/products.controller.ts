import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductCharacteristicDto } from './dto/add-product-characteristic.dto';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Товары')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @ApiOperation({ summary: 'Создать товар' })
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiOperation({ summary: 'Все товары' })
  @Get()
  getAll() {
    return this.productsService.getAll();
  }

  @ApiOperation({ summary: 'Товар по id' })
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.productsService.getOne(id);
  }

  @ApiOperation({ summary: 'Обновить товар' })
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить товар' })
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productsService.delete(id);
  }

  @ApiOperation({ summary: 'Добавить характеристики товару' })
  @Post('characteristics')
  addCharacteristics(@Body() dto: AddProductCharacteristicDto) {
    return this.productsService.addCharacteristics(dto);
  }

  @ApiOperation({ summary: 'Получить характеристики товара' })
  @Get(':id/characteristics')
  getProductCharacteristics(@Param('id') id: number) {
    return this.productsService.getProductCharacteristics(id);
  }

  @ApiOperation({ summary: 'Записать приход товара' })
  @Post('entrance')
  createEntrance(@Body() dto: CreateEntranceDto) {
    return this.productsService.createEntrance(dto);
  }

  @ApiOperation({ summary: 'Приходы по товару' })
  @Get('entrance/:productId')
  getEntrances(@Param('productId') productId: number) {
    return this.productsService.getEntrancesByProduct(productId);
  }
}