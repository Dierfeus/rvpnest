import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DiscountType } from './discount-type.model';
import { Discount } from './discount.model';
import { CreateDiscountTypeDto } from './dto/create-discount-type.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { Op } from 'sequelize';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(DiscountType) private discountTypeRepository: typeof DiscountType,
    @InjectModel(Discount) private discountRepository: typeof Discount,
  ) {}

  async createDiscountType(dto: CreateDiscountTypeDto) {
    // Исправлено: передаём plain object вместо DTO
    return this.discountTypeRepository.create({
      name: dto.name,
    } as any);
  }

  async getAllDiscountTypes() {
    return this.discountTypeRepository.findAll({ include: ['discounts'] });
  }

  async createDiscount(dto: CreateDiscountDto) {
    // Исправлено: преобразуем строки в Date объекты
    return this.discountRepository.create({
      id_discountsType: dto.id_discountsType,
      name: dto.name,
      size: dto.size,
      start_time: new Date(dto.start_time),
      end_time: new Date(dto.end_time),
    } as any);
  }

  async getAllDiscounts() {
    return this.discountRepository.findAll({ include: ['discountType'] });
  }

  async getActiveDiscounts() {
    const now = new Date();
    return this.discountRepository.findAll({
      where: {
        start_time: { [Op.lte]: now },
        end_time: { [Op.gte]: now },
      },
      include: ['discountType'],
    });
  }
}