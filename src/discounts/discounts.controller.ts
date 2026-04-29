import { Controller, Get, Post, Body } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountTypeDto } from './dto/create-discount-type.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Скидки')
@Controller('discounts')
export class DiscountsController {
  constructor(private discountsService: DiscountsService) {}

  @ApiOperation({ summary: 'Тип скидки' })
  @Post('types')
  createType(@Body() dto: CreateDiscountTypeDto) {
    return this.discountsService.createDiscountType(dto);
  }

  @ApiOperation({ summary: 'Все типы скидок' })
  @Get('types')
  getAllTypes() {
    return this.discountsService.getAllDiscountTypes();
  }

  @ApiOperation({ summary: 'Создать скидку' })
  @Post()
  create(@Body() dto: CreateDiscountDto) {
    return this.discountsService.createDiscount(dto);
  }

  @ApiOperation({ summary: 'Все скидки' })
  @Get()
  getAll() {
    return this.discountsService.getAllDiscounts();
  }

  @ApiOperation({ summary: 'Активные скидки' })
  @Get('active')
  getActive() {
    return this.discountsService.getActiveDiscounts();
  }
}