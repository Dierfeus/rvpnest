import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private categoryRepository: typeof Category) {}

  async create(dto: CreateCategoryDto) {
    const parentId = dto.id_parent_category === 0 || dto.id_parent_category === undefined
        ? null
        : dto.id_parent_category;

    if (parentId !== null) {
      const parent = await this.categoryRepository.findByPk(parentId);
      if (!parent) {
        throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
      }
    }

    return this.categoryRepository.create({
      category: dto.category,
      id_parent_category: parentId,
      image_url: dto.image_url || null,
      icon_class: dto.icon_class || null,
      description: dto.description || null,
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.getOne(id);

    const updateData: any = {};

    if (dto.category !== undefined) updateData.category = dto.category;

    if (dto.id_parent_category !== undefined) {
      const parentId = dto.id_parent_category === 0 ? null : dto.id_parent_category;
      if (parentId !== null) {
        const parent = await this.categoryRepository.findByPk(parentId);
        if (!parent) {
          throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
        }
        if (parentId === id) {
          throw new HttpException('Категория не может быть родителем самой себя', HttpStatus.BAD_REQUEST);
        }
      }
      updateData.id_parent_category = parentId;
    }

    if (dto.image_url !== undefined) updateData.image_url = dto.image_url;
    if (dto.icon_class !== undefined) updateData.icon_class = dto.icon_class;
    if (dto.description !== undefined) updateData.description = dto.description;

    await category.update(updateData);
    return this.getOne(id);
  }

  async getAll(parentId?: number | null) {
    const where: any = {};

    if (parentId === 0) {
      where.id_parent_category = null;
    } else if (parentId !== undefined && parentId !== null) {
      where.id_parent_category = parentId;
    }

    return this.categoryRepository.findAll({
      where,
      include: ['children']
    });
  }

  async getOne(id: number) {
    const category = await this.categoryRepository.findByPk(id, {
      include: ['parent', 'children']
    });
    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  async delete(id: number) {
    const category = await this.getOne(id);

    const children = await this.categoryRepository.findAll({
      where: { id_parent_category: id }
    });
    if (children.length > 0) {
      throw new HttpException('Нельзя удалить категорию с подкатегориями', HttpStatus.BAD_REQUEST);
    }

    await category.destroy();
    return { message: 'Категория удалена' };
  }
}