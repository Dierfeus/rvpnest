import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AddProductCharacteristicDto } from './dto/add-product-characteristic.dto';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

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

  @ApiOperation({ summary: 'Добавить характеристику товару' })
  @Post('characteristic')
  addCharacteristic(@Body() dto: AddProductCharacteristicDto) {
    return this.productsService.addCharacteristic(dto);
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