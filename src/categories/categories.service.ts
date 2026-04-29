import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private categoryRepository: typeof Category) {}

  async create(dto: CreateCategoryDto) {
    return this.categoryRepository.create(dto);
  }

  async getAll() {
    return this.categoryRepository.findAll({ include: ['children'] });
  }

  async getOne(id: number) {
    return this.categoryRepository.findByPk(id, { include: ['parent', 'children'] });
  }
}