import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DiscountType } from './discount-type.model';
import { Discount } from './discount.model';
import { ProductDiscount } from './product-discount.model';
import { Product } from '../products/products.model';
import { CreateDiscountTypeDto } from './dto/create-discount-type.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Op } from 'sequelize';

@Injectable()
export class DiscountsService {
  constructor(
      @InjectModel(DiscountType) private discountTypeRepository: typeof DiscountType,
      @InjectModel(Discount) private discountRepository: typeof Discount,
      @InjectModel(ProductDiscount) private productDiscountRepository: typeof ProductDiscount,
      @InjectModel(Product) private productRepository: typeof Product,
  ) {}

  async createDiscountType(dto: CreateDiscountTypeDto) {
    const existing = await this.discountTypeRepository.findOne({
      where: { name: dto.name }
    });
    if (existing) {
      throw new HttpException('Тип скидки с таким названием уже существует', HttpStatus.BAD_REQUEST);
    }
    return this.discountTypeRepository.create(dto as any);
  }

  async getAllDiscountTypes() {
    return this.discountTypeRepository.findAll({
      include: ['discounts']
    });
  }

  async getDiscountTypeById(id: number) {
    const type = await this.discountTypeRepository.findByPk(id);
    if (!type) {
      throw new HttpException('Тип скидки не найден', HttpStatus.NOT_FOUND);
    }
    return type;
  }

  async createDiscount(dto: CreateDiscountDto) {
    const discountType = await this.getDiscountTypeById(dto.id_discountsType);
    if (!discountType) {
      throw new HttpException('Тип скидки не найден', HttpStatus.NOT_FOUND);
    }
    if (dto.code) {
      const existing = await this.discountRepository.findOne({
        where: { code: dto.code }
      });
      if (existing) {
        throw new HttpException('Промокод с таким кодом уже существует', HttpStatus.BAD_REQUEST);
      }
    }

    const discount = await this.discountRepository.create({
      id_discountsType: dto.id_discountsType,
      name: dto.name,
      code: dto.code,
      type: dto.type || 'percentage',
      size: dto.size,
      start_time: new Date(dto.start_time),
      end_time: new Date(dto.end_time),
      min_order_amount: dto.min_order_amount,
      max_discount_amount: dto.max_discount_amount,
      usage_limit: dto.usage_limit,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    } as any);

    // Если есть товары - привязываем
    if (dto.productIds && dto.productIds.length > 0) {
      for (const productId of dto.productIds) {
        const product = await this.productRepository.findByPk(productId);
        if (!product) {
          throw new HttpException(`Товар с ID ${productId} не найден`, HttpStatus.NOT_FOUND);
        }
        await this.productDiscountRepository.create({
          id_product: productId,
          id_discount: discount.id_discount,
          is_active: true,
        } as any);
      }
    }

    return this.getDiscountById(discount.id_discount);
  }

  async getAllDiscounts() {
    return this.discountRepository.findAll({
      include: ['discountType', 'productDiscounts']
    });
  }

  async getDiscountById(id: number) {
    const discount = await this.discountRepository.findByPk(id, {
      include: [
        'discountType',
        {
          association: 'productDiscounts',
          include: ['product']
        }
      ]
    });
    if (!discount) {
      throw new HttpException('Скидка не найдена', HttpStatus.NOT_FOUND);
    }
    return discount;
  }

  async getDiscountByCode(code: string) {
    const discount = await this.discountRepository.findOne({
      where: { code, is_active: true },
      include: ['discountType', 'productDiscounts']
    });
    return discount;
  }

  async updateDiscount(id: number, dto: UpdateDiscountDto) {
    const discount = await this.getDiscountById(id);

    if (dto.code) {
      const existing = await this.discountRepository.findOne({
        where: {
          code: dto.code,
          id_discount: { [Op.ne]: id }
        }
      });
      if (existing) {
        throw new HttpException('Промокод с таким кодом уже существует', HttpStatus.BAD_REQUEST);
      }
    }
    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.size !== undefined) updateData.size = dto.size;
    if (dto.start_time !== undefined) updateData.start_time = new Date(dto.start_time);
    if (dto.end_time !== undefined) updateData.end_time = new Date(dto.end_time);
    if (dto.min_order_amount !== undefined) updateData.min_order_amount = dto.min_order_amount;
    if (dto.max_discount_amount !== undefined) updateData.max_discount_amount = dto.max_discount_amount;
    if (dto.usage_limit !== undefined) updateData.usage_limit = dto.usage_limit;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    await discount.update(updateData);

    // Обновляем привязку товаров
    if (dto.productIds !== undefined) {
      await this.productDiscountRepository.destroy({
        where: { id_discount: id }
      });
      for (const productId of dto.productIds) {
        await this.productDiscountRepository.create({
          id_product: productId,
          id_discount: id,
          is_active: true,
        } as any);
      }
    }

    return this.getDiscountById(id);
  }

  async deleteDiscount(id: number) {
    const discount = await this.getDiscountById(id);
    await this.productDiscountRepository.destroy({
      where: { id_discount: id }
    });
    await discount.destroy();
    return { message: 'Скидка удалена' };
  }

  async getActiveDiscounts() {
    const now = new Date();
    return this.discountRepository.findAll({
      where: {
        start_time: { [Op.lte]: now },
        end_time: { [Op.gte]: now },
        is_active: true,
      },
      include: ['discountType', 'productDiscounts']
    });
  }

  async addProductToDiscount(discountId: number, productId: number) {
    const discount = await this.getDiscountById(discountId);
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const existing = await this.productDiscountRepository.findOne({
      where: { id_discount: discountId, id_product: productId }
    });
    if (existing) {
      throw new HttpException('Товар уже привязан к этой скидке', HttpStatus.BAD_REQUEST);
    }

    return this.productDiscountRepository.create({
      id_discount: discountId,
      id_product: productId,
      is_active: true,
    } as any);
  }

  async removeProductFromDiscount(discountId: number, productId: number) {
    const relation = await this.productDiscountRepository.findOne({
      where: { id_discount: discountId, id_product: productId }
    });
    if (!relation) {
      throw new HttpException('Связь не найдена', HttpStatus.NOT_FOUND);
    }
    await relation.destroy();
    return { message: 'Товар отвязан от скидки' };
  }

  async getDiscountsByProduct(productId: number) {
    return this.productDiscountRepository.findAll({
      where: { id_product: productId, is_active: true },
      include: ['discount']
    });
  }

  async getProductsByDiscount(discountId: number) {
    const discount = await this.getDiscountById(discountId);
    return discount.productDiscounts;
  }
}