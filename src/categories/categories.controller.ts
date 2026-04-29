import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Категории')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Создать категорию' })
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiOperation({ summary: 'Получить все категории' })
  @Get()
  getAll() {
    return this.categoriesService.getAll();
  }

  @ApiOperation({ summary: 'Получить категорию по id' })
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.categoriesService.getOne(id);
  }
}